import { Queue } from 'bullmq';
import { defaultQueueOptions, QUEUE_NAMES } from './queue.config';
import logger from '../utils/logger';
import colors from 'colors';

const emailQueue = new Queue(QUEUE_NAMES.EMAIL, defaultQueueOptions);

export const addEmailToQueue = async (data: { to: string; subject: string; html: string }) => {
  try {
    logger.info(colors.blue(`📧 Adding email to queue:`));
    logger.info(colors.cyan(`   📬 To: ${data.to}`));
    logger.info(colors.cyan(`   📝 Subject: ${data.subject}`));
    await emailQueue.add('sendEmail', data);
  } catch (error) {
    logger.error(colors.red('❌ Failed to add email to queue:'), error);
    throw error;
  }
};

export default emailQueue;
