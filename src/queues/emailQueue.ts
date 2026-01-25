import { redisClient } from '@/config/redis.config';
import { Queue } from 'bullmq';
const emailQueue = new Queue('email-queue', {
  connection: redisClient,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: true,
    
  },
});
