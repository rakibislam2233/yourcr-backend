import { Job, Worker } from 'bullmq';
import colors from 'colors';
import { NotificationRepository } from '../modules/notification/notification.repository';
import { UserRepository } from '../modules/user/user.repository';
import { addEmailToQueue } from '../queues/email.queue';
import { NotificationJobData } from '../queues/notification.queue';
import { defaultWorkerOptions, QUEUE_NAMES } from '../queues/queue.config';
import { emitNotificationToUser } from '../socket/socket.service';
import { getEmailTemplate } from '../templates/email.template';
import logger from '../utils/logger';
import { sendPushNotificationToUser } from '../utils/pushNotification.utils';

const notificationWorker = new Worker(
  QUEUE_NAMES.NOTIFICATION,
  async (job: Job<NotificationJobData>) => {
    const { title, message, type, relatedId, institutionId, targetRole, userIds, crId } = job.data;

    let recipients: string[] = [];
    if (userIds?.length) {
      recipients = userIds;
    } else if (crId) {
      const users: Array<{ id: string; email: string | null }> =
        await UserRepository.getStudentsByCrId(crId);
      recipients = users.map(user => user.id);
    } else if (institutionId && targetRole) {
      const users: Array<{ id: string; email: string | null }> =
        await UserRepository.getUsersByInstitutionAndRole(institutionId, targetRole);
      recipients = users.map(user => user.id);
    }

    logger.info(colors.blue(`📬 Sending notifications to ${recipients.length} user(s)`));

    for (const userId of recipients) {
      // 1. Save to database
      const notification = await NotificationRepository.createNotification({
        userId,
        title,
        message,
        type,
        relatedId,
      });

      // 2. Send real-time notification via Socket.IO
      emitNotificationToUser(userId, notification);

      // 3. Send email
      const user = await UserRepository.getUserById(userId);
      if (user?.email) {
        await addEmailToQueue({
          to: user.email,
          subject: title,
          html: getEmailTemplate(title, message, type),
        });
      }

      // 4. Send push notification (FCM for mobile + Web Push for browsers)
      await sendPushNotificationToUser(userId, {
        title,
        body: message,
        data: {
          type,
          relatedId: relatedId || '',
        },
      });
    }

    logger.info(colors.green(`✅ Notifications sent to ${recipients.length} user(s)`));
  },
  defaultWorkerOptions
);

notificationWorker.on('completed', job => {
  logger.info(colors.green(`✅ Notification job ${job.id} completed`));
});

notificationWorker.on('failed', (job, err) => {
  logger.error(colors.red(`❌ Notification job ${job?.id} failed: ${err.message}`));
});

export default notificationWorker;
