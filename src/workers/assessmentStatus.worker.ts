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

    const assessment = await database.assessment.update({
      where: { id: assessmentId },
      data: { status: newStatus },
      include: {
        batch: {
          include: {
            enrollments: {
              where: { isActive: true },
              select: { userId: true },
            },
          },
        },
      },
    });

    // If assessment is marked COMPLETED, identify missing submissions
    if (newStatus === 'COMPLETED' && assessment.batch?.enrollments) {
      const enrolledStudents = assessment.batch.enrollments.map(e => e.userId);

      // Get existing submissions
      const existingSubmissions = await database.assessmentSubmission.findMany({
        where: {
          assessmentId,
          studentId: { in: enrolledStudents },
        },
        select: { studentId: true },
      });

      const submittedStudentIds = new Set(existingSubmissions.map(s => s.studentId));

      const missingStudentIds = enrolledStudents.filter(id => !submittedStudentIds.has(id));

      if (missingStudentIds.length > 0) {
        // Bulk create missing submissions
        await database.assessmentSubmission.createMany({
          data: missingStudentIds.map(studentId => ({
            assessmentId,
            studentId,
            status: 'MISSING',
            submittedAt: new Date(), // Set to now as the timestamp of missing
            batchId: assessment.batchId,
          })),
        });

        logger.info(
          colors.yellow(
            `⚠️ Marked ${missingStudentIds.length} missing submissions for assessment ${assessmentId}`
          )
        );
      }
    }

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
