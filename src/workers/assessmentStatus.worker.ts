import { Job, Worker } from 'bullmq';
import colors from 'colors';
import { database } from '../config/database.config';
import { AssessmentStatusJobData } from '../queues/assessmentStatus.queue';
import { QUEUE_NAMES, defaultWorkerOptions } from '../queues/queue.config';
import logger from '../utils/logger';

const assessmentStatusWorker = new Worker(
  QUEUE_NAMES.ASSESSMENT_STATUS,
  async (job: Job<AssessmentStatusJobData>) => {
    const { assessmentId, newStatus } = job.data;

    await database.assessment.update({
      where: { id: assessmentId },
      data: { status: newStatus },
    });

    logger.info(colors.green(`✅ Assessment ${assessmentId} status updated to ${newStatus}`));
  },
  defaultWorkerOptions
);

assessmentStatusWorker.on('completed', job => {
  logger.info(colors.green(`✅ Assessment status update job ${job.id} completed`));
});

assessmentStatusWorker.on('failed', (job, err) => {
  logger.error(colors.red(`❌ Assessment status update job ${job?.id} failed: ${err.message}`));
});

export default assessmentStatusWorker;
