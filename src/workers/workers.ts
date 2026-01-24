import { Worker, Job } from 'bullmq';
import redisClient from '../config/redis.config';
import logger from '../utils/logger';
import { sendEmail } from '../utils/sendEmail';

// Email worker processor
const emailProcessor = async (job: Job) => {
  const { to, subject, html, text } = job.data;
  
  logger.info(`Processing email job: ${job.id} to ${to}`);
  
  try {
    await sendEmail({
      to,
      subject,
      html,
      text,
    });
    
    logger.info(`Email sent successfully: ${job.id}`);
    return { success: true, jobId: job.id };
  } catch (error) {
    logger.error(`Email job failed: ${job.id}`, error);
    throw error;
  }
};

// File processing worker processor
const fileProcessingProcessor = async (job: Job) => {
  const { fileId, filePath, operation } = job.data;
  
  logger.info(`Processing file job: ${job.id} - ${operation}`);
  
  try {
    // Simulate file processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    logger.info(`File processed successfully: ${job.id}`);
    return { success: true, jobId: job.id, fileId };
  } catch (error) {
    logger.error(`File processing job failed: ${job.id}`, error);
    throw error;
  }
};

// Notification worker processor
const notificationProcessor = async (job: Job) => {
  const { userId, type, message } = job.data;
  
  logger.info(`Processing notification job: ${job.id} - ${type}`);
  
  try {
    // Simulate notification sending
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    logger.info(`Notification sent successfully: ${job.id}`);
    return { success: true, jobId: job.id, userId };
  } catch (error) {
    logger.error(`Notification job failed: ${job.id}`, error);
    throw error;
  }
};

// Cleanup worker processor
const cleanupProcessor = async (job: Job) => {
  const { cleanupType, data } = job.data;
  
  logger.info(`Processing cleanup job: ${job.id} - ${cleanupType}`);
  
  try {
    // Simulate cleanup operation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    logger.info(`Cleanup completed successfully: ${job.id}`);
    return { success: true, jobId: job.id };
  } catch (error) {
    logger.error(`Cleanup job failed: ${job.id}`, error);
    throw error;
  }
};

// Create workers
export const emailWorker = new Worker('email', emailProcessor, {
  connection: redisClient,
  concurrency: 5,
});

export const fileProcessingWorker = new Worker('file-processing', fileProcessingProcessor, {
  connection: redisClient,
  concurrency: 3,
});

export const notificationWorker = new Worker('notification', notificationProcessor, {
  connection: redisClient,
  concurrency: 10,
});

export const cleanupWorker = new Worker('cleanup', cleanupProcessor, {
  connection: redisClient,
  concurrency: 1,
});

// Worker event listeners
emailWorker.on('completed', (job) => {
  logger.info(`Email worker completed job ${job.id}`);
});

emailWorker.on('failed', (job, error) => {
  logger.error(`Email worker failed job ${job?.id}:`, error);
});

fileProcessingWorker.on('completed', (job) => {
  logger.info(`File processing worker completed job ${job.id}`);
});

fileProcessingWorker.on('failed', (job, error) => {
  logger.error(`File processing worker failed job ${job?.id}:`, error);
});

notificationWorker.on('completed', (job) => {
  logger.info(`Notification worker completed job ${job.id}`);
});

notificationWorker.on('failed', (job, error) => {
  logger.error(`Notification worker failed job ${job?.id}:`, error);
});

cleanupWorker.on('completed', (job) => {
  logger.info(`Cleanup worker completed job ${job.id}`);
});

cleanupWorker.on('failed', (job, error) => {
  logger.error(`Cleanup worker failed job ${job?.id}:`, error);
});

logger.info('_workers initialized successfully');

// Graceful shutdown
export const closeWorkers = async () => {
  await emailWorker.close();
  await fileProcessingWorker.close();
  await notificationWorker.close();
  await cleanupWorker.close();
  logger.info('All workers closed');
};