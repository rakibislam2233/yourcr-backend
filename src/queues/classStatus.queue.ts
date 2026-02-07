import { Queue } from 'bullmq';
import colors from 'colors';
import logger from '../utils/logger';
import { defaultQueueOptions, QUEUE_NAMES } from './queue.config';

export interface ClassStatusJobData {
  classId: string;
  newStatus: 'ONGOING' | 'COMPLETED';
  scheduledFor: Date;
}

const classStatusQueue = new Queue(QUEUE_NAMES.CLASS_STATUS, defaultQueueOptions);

export const scheduleClassStatusUpdate = async (
  classId: string,
  startTime: Date,
  endTime: Date
) => {
  try {
    const now = new Date();

    // Schedule ONGOING status at start time
    const startDelay = startTime.getTime() - now.getTime();
    if (startDelay > 0) {
      await classStatusQueue.add(
        'updateStatus',
        {
          classId,
          newStatus: 'ONGOING',
          scheduledFor: startTime,
        },
        {
          delay: startDelay,
          jobId: `${classId}-ongoing`, // Unique ID to prevent duplicates
        }
      );
      logger.info(colors.blue(`⏰ Scheduled class ${classId} to ONGOING at ${startTime}`));
    }

    // Schedule COMPLETED status at end time
    const endDelay = endTime.getTime() - now.getTime();
    if (endDelay > 0) {
      await classStatusQueue.add(
        'updateStatus',
        {
          classId,
          newStatus: 'COMPLETED',
          scheduledFor: endTime,
        },
        {
          delay: endDelay,
          jobId: `${classId}-completed`, // Unique ID to prevent duplicates
        }
      );
      logger.info(colors.blue(`⏰ Scheduled class ${classId} to COMPLETED at ${endTime}`));
    }
  } catch (error) {
    logger.error(colors.red('❌ Failed to schedule class status update:'), error);
    throw error;
  }
};

export const cancelClassStatusUpdates = async (classId: string) => {
  try {
    // Remove scheduled jobs if class is cancelled or deleted
    await classStatusQueue.remove(`${classId}-ongoing`);
    await classStatusQueue.remove(`${classId}-completed`);
    logger.info(colors.yellow(`🗑️  Cancelled status updates for class ${classId}`));
  } catch (error) {
    logger.error(colors.red('❌ Failed to cancel class status updates:'), error);
  }
};

export default classStatusQueue;
