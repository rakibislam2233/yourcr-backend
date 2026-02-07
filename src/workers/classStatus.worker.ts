import { Job, Worker } from 'bullmq';
import colors from 'colors';
import { ClassRepository } from '../modules/class/class.repository';
import { ClassStatusJobData } from '../queues/classStatus.queue';
import { addNotificationJob } from '../queues/notification.queue';
import { defaultWorkerOptions, QUEUE_NAMES } from '../queues/queue.config';
import logger from '../utils/logger';

const classStatusWorker = new Worker(
  QUEUE_NAMES.CLASS_STATUS,
  async (job: Job<ClassStatusJobData>) => {
    const { classId, newStatus, scheduledFor } = job.data;

    logger.info(colors.blue(`🔄 Processing class status update for ${classId}`));
    logger.info(colors.cyan(`   New Status: ${newStatus}`));
    logger.info(colors.cyan(`   Scheduled For: ${scheduledFor}`));

    try {
      // Get current class details
      const classItem = await ClassRepository.getClassById(classId);

      if (!classItem || (classItem as any).isDeleted) {
        logger.warn(
          colors.yellow(`⚠️  Class ${classId} not found or deleted, skipping status update`)
        );
        return;
      }

      // Check if class is cancelled
      if ((classItem as any).status === 'CANCELLED') {
        logger.warn(colors.yellow(`⚠️  Class ${classId} is cancelled, skipping status update`));
        return;
      }

      // Update status
      await ClassRepository.updateClass(classId, { status: newStatus });

      logger.info(colors.green(`✅ Class ${classId} status updated to ${newStatus}`));

      // Send notification to students
      const statusMessages = {
        ONGOING: '🟢 Your class has started! Join now.',
        COMPLETED: '✅ Class has ended. Thank you for attending!',
      };

      await addNotificationJob({
        title: `Class ${newStatus}: ${(classItem as any).subject?.name || 'Class'}`,
        message: statusMessages[newStatus],
        type: 'NOTICE',
        relatedId: classId,
        crId: (classItem as any).createdById,
      });

      logger.info(colors.green(`📧 Notification sent for class status change`));
    } catch (error) {
      logger.error(colors.red(`❌ Failed to update class status: ${error}`));
      throw error;
    }
  },
  defaultWorkerOptions
);

classStatusWorker.on('completed', job => {
  logger.info(colors.green(`✅ Class status job ${job.id} completed`));
});

classStatusWorker.on('failed', (job, err) => {
  logger.error(colors.red(`❌ Class status job ${job?.id} failed: ${err.message}`));
});

export default classStatusWorker;
