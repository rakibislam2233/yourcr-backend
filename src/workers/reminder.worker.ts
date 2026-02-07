import { Job, Worker } from 'bullmq';
import colors from 'colors';
import { addNotificationJob } from '../queues/notification.queue';
import { defaultWorkerOptions, QUEUE_NAMES } from '../queues/queue.config';
import { ReminderJobData } from '../queues/reminder.queue';
import logger from '../utils/logger';

const reminderWorker = new Worker(
  QUEUE_NAMES.REMINDER,
  async (job: Job<ReminderJobData>) => {
    const { type, title, message, relatedId, userIds, crId } = job.data;

    logger.info(colors.magenta(`⏰ Processing reminder job ${job.id}`));
    logger.info(colors.cyan(`   Type: ${type}`));
    logger.info(colors.cyan(`   Title: ${title}`));

    // Send notification to users
    await addNotificationJob({
      title,
      message,
      type: type === 'ASSESSMENT_REMINDER' ? 'ASSESSMENT' : 'NOTICE',
      relatedId,
      userIds,
      crId,
    });

    logger.info(colors.green(`✅ Reminder sent successfully`));
  },
  defaultWorkerOptions
);

reminderWorker.on('completed', job => {
  logger.info(colors.green(`✅ Reminder job ${job.id} completed`));
});

reminderWorker.on('failed', (job, err) => {
  logger.error(colors.red(`❌ Reminder job ${job?.id} failed: ${err.message}`));
});

export default reminderWorker;
