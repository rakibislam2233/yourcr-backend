import { Worker } from 'bullmq';
import { sendEmailDirect } from '../services/email.service';
import { logger } from '../config/logger.config';

// Email worker to process email jobs
export const emailWorker = new Worker(
  'email-processing',
  async (job) => {
    const { data } = job;
    
    logger.info(`📧 Processing email job`, {
      jobId: job.id,
      to: data.to,
      subject: data.subject,
    });

    try {
      await sendEmailDirect(data);
      logger.info(`✅ Email job completed successfully`, {
        jobId: job.id,
      });
    } catch (error) {
      logger.error(`❌ Email job failed`, {
        jobId: job.id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  },
  {
    connection: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
    },
    concurrency: 5, // Process 5 emails concurrently
  }
);

// Handle worker events
emailWorker.on('completed', (job) => {
  logger.info(`✅ Job ${job.id} completed`);
});

emailWorker.on('failed', (job, err) => {
  logger.error(`❌ Job ${job?.id} failed:`, err);
});

emailWorker.on('error', (err) => {
  logger.error('❌ Email worker error:', err);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('🛑 Shutting down email worker...');
  await emailWorker.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('🛑 Shutting down email worker...');
  await emailWorker.close();
  process.exit(0);
});

logger.info('📧 Email worker initialized and listening for jobs');