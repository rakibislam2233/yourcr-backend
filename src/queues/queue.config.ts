import { QueueOptions, WorkerOptions } from 'bullmq';
import config from '../config';

// Redis connection for BullMQ
export const queueConnection = {
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  username: config.redis.username,
};

// Default queue options
export const defaultQueueOptions: QueueOptions = {
  connection: queueConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential', // Retry delay exponentially increases
      delay: 5000, // Initial delay: 5 seconds
    },
    removeOnComplete: {
      age: 24 * 3600, // Keep completed jobs for 24 hours
      count: 1000, // Keep last 1000 completed jobs
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // Keep failed jobs for 7 days
    },
  },
};

// Default worker options
export const defaultWorkerOptions: WorkerOptions = {
  connection: queueConnection,
  concurrency: 5,
  limiter: {
    max: 10,
    duration: 1000,
  },
};

// Queue names
export const QUEUE_NAMES = {
  EMAIL: 'emails',
  NOTIFICATION: 'notifications',
  REMINDER: 'reminders',
} as const;
