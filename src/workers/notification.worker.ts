import { Job, Worker } from 'bullmq';
import { defaultWorkerOptions, QUEUE_NAMES } from '../queues/queue.config';
import { NotificationJobData } from '../queues/notification.queue';
import { UserRepository } from '../modules/user/user.repository';
import { NotificationRepository } from '../modules/notification/notification.repository';
import { addEmailToQueue } from '../queues/email.queue';
import { emitNotificationToUser } from '../socket/socket.service';
import { getEmailTemplate } from '../templates/email.template';

const notificationWorker = new Worker(
  QUEUE_NAMES.NOTIFICATION,
  async (job: Job<NotificationJobData>) => {
    const { title, message, type, relatedId, institutionId, targetRole, userIds, crId } = job.data;

    let recipients: string[] = [];
    if (userIds?.length) {
      recipients = userIds;
    } else if (crId) {
      const users: Array<{ id: string; email: string | null }> = await UserRepository.getStudentsByCrId(crId);
      recipients = users.map(user => user.id);
    } else if (institutionId && targetRole) {
      const users: Array<{ id: string; email: string | null }> =
        await UserRepository.getUsersByInstitutionAndRole(institutionId, targetRole);
      recipients = users.map(user => user.id);
    }

    for (const userId of recipients) {
      const notification = await NotificationRepository.createNotification({
        userId,
        title,
        message,
        type,
        relatedId,
      });

      emitNotificationToUser(userId, notification);

      const user = await UserRepository.getUserById(userId);
      if (user?.email) {
        await addEmailToQueue({
          to: user.email,
          subject: title,
          html: getEmailTemplate(title, message, type),
        });
      }
    }
  },
  defaultWorkerOptions
);

notificationWorker.on('completed', (job) => {
  console.log(`Notification job ${job.id} completed`);
});

notificationWorker.on('failed', (job, err) => {
  console.error(`Notification job ${job?.id} failed: ${err.message}`);
});

export default notificationWorker;
