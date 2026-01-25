import { Queue } from 'bullmq';
import { defaultQueueOptions, QUEUE_NAMES } from './queue.config';

const emailQueue = new Queue(QUEUE_NAMES.EMAIL, defaultQueueOptions);

export const addEmailToQueue = async (data: { to: string; subject: string; html: string }) => {
  await emailQueue.add('sendEmail', data);
};

export default emailQueue;
