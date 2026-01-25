import { Job, Worker } from 'bullmq';
import { defaultWorkerOptions, QUEUE_NAMES } from '../queues/queue.config';
import { sendEmail } from '../utils/sendEmail';

const emailWorker = new Worker(
  QUEUE_NAMES.EMAIL,
  async (job: Job) => {
    const { to, subject, html } = job.data;
    console.log(`Processing email job ${job.id} to ${to}`);
    await sendEmail({ to, subject, html });
  },
  defaultWorkerOptions
);

emailWorker.on('completed', job => {
  console.log(`Email job ${job.id} completed`);
});

emailWorker.on('failed', (job, err) => {
  console.error(`Email job ${job?.id} failed: ${err.message}`);
});

export default emailWorker;
