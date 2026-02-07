import { AssessmentStatus } from '@prisma/client';
import { Queue } from 'bullmq';
import colors from 'colors';
import logger from '../utils/logger';
import { defaultQueueOptions, QUEUE_NAMES } from './queue.config';

export interface AssessmentStatusJobData {
  assessmentId: string;
  newStatus: AssessmentStatus;
  scheduledFor: Date;
}

const assessmentStatusQueue = new Queue(QUEUE_NAMES.ASSESSMENT_STATUS, defaultQueueOptions);

export const scheduleAssessmentStatusUpdate = async (
  assessmentId: string,
  startTime: Date,
  deadline: Date
) => {
  try {
    const now = new Date();

    // Schedule ACTIVE status at start time
    const startDelay = startTime.getTime() - now.getTime();
    if (startDelay > 0) {
      await assessmentStatusQueue.add(
        'updateStatus',
        {
          assessmentId,
          newStatus: AssessmentStatus.ACTIVE,
          scheduledFor: startTime,
        },
        {
          delay: startDelay,
          jobId: `${assessmentId}-active`, // Unique ID
        }
      );
      logger.info(colors.blue(`⏰ Scheduled assessment ${assessmentId} to ACTIVE at ${startTime}`));
    }

    // Schedule COMPLETED status at deadline
    const endDelay = deadline.getTime() - now.getTime();
    if (endDelay > 0) {
      await assessmentStatusQueue.add(
        'updateStatus',
        {
          assessmentId,
          newStatus: AssessmentStatus.COMPLETED,
          scheduledFor: deadline,
        },
        {
          delay: endDelay,
          jobId: `${assessmentId}-completed`, // Unique ID
        }
      );
      logger.info(
        colors.blue(`⏰ Scheduled assessment ${assessmentId} to COMPLETED at ${deadline}`)
      );
    }
  } catch (error) {
    logger.error(colors.red('❌ Failed to schedule assessment status update:'), error);
    throw error;
  }
};

export const cancelAssessmentStatusUpdates = async (assessmentId: string) => {
  try {
    await assessmentStatusQueue.remove(`${assessmentId}-active`);
    await assessmentStatusQueue.remove(`${assessmentId}-completed`);
    logger.info(colors.yellow(`🗑️  Cancelled status updates for assessment ${assessmentId}`));
  } catch (error) {
    logger.error(colors.red('❌ Failed to cancel assessment status updates:'), error);
  }
};

export default assessmentStatusQueue;
