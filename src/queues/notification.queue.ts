import { Queue } from 'bullmq';
import colors from 'colors';
import logger from '../utils/logger';
import { defaultQueueOptions, QUEUE_NAMES } from './queue.config';

export interface NotificationJobData {
  title: string;
  message: string;
  type: 'NOTICE' | 'ASSESSMENT' | 'ISSUE' | 'SYSTEM' | 'CLASS' | 'CLASS_UPDATE';
  relatedId?: string;
  institutionId?: string;
  targetRole?: string;
  userIds?: string[];
  crId?: string;
}

const notificationQueue = new Queue(QUEUE_NAMES.NOTIFICATION, defaultQueueOptions);

export const addNotificationJob = async (data: NotificationJobData) => {
  try {
    logger.info(colors.blue('🔔 Adding notification job'));
    await notificationQueue.add('sendNotification', data);
  } catch (error) {
    logger.error(colors.red('❌ Failed to add notification job:'), error);
    throw error;
  }
};

export default notificationQueue;
