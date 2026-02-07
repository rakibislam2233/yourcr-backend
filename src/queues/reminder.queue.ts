import { Queue } from 'bullmq';
import colors from 'colors';
import logger from '../utils/logger';
import { defaultQueueOptions, QUEUE_NAMES } from './queue.config';

export interface ReminderJobData {
  type: 'CLASS_REMINDER' | 'ASSESSMENT_REMINDER' | 'CLASS_UPDATE';
  title: string;
  message: string;
  relatedId: string;
  scheduledFor: Date;
  userIds?: string[];
  crId?: string;
}

const reminderQueue = new Queue(QUEUE_NAMES.REMINDER, defaultQueueOptions);

export const addReminderJob = async (data: ReminderJobData, delay?: number) => {
  try {
    logger.info(colors.magenta('⏰ Adding reminder job'));
    logger.info(colors.cyan(`   📅 Scheduled for: ${data.scheduledFor}`));
    logger.info(colors.cyan(`   📝 Type: ${data.type}`));

    await reminderQueue.add('sendReminder', data, {
      delay: delay || 0, // delay in milliseconds
    });
  } catch (error) {
    logger.error(colors.red('❌ Failed to add reminder job:'), error);
    throw error;
  }
};

export const scheduleAssessmentReminder = async (
  assessmentId: string,
  deadline: Date,
  title: string,
  crId: string
) => {
  const reminderDate = new Date(deadline);
  reminderDate.setDate(reminderDate.getDate() - 1); // 1 day before deadline
  reminderDate.setHours(9, 0, 0, 0); // Set to 9 AM

  const now = new Date();
  const delay = reminderDate.getTime() - now.getTime();

  if (delay > 0) {
    await addReminderJob(
      {
        type: 'ASSESSMENT_REMINDER',
        title: `⏰ Reminder: ${title}`,
        message: `Assessment deadline is tomorrow at ${deadline.toLocaleString()}. Please submit your work!`,
        relatedId: assessmentId,
        scheduledFor: reminderDate,
        crId,
      },
      delay
    );
  }
};

export const scheduleClassReminder = async (
  classId: string,
  classDate: Date,
  classTitle: string,
  crId: string
) => {
  const reminderDate = new Date(classDate);
  reminderDate.setHours(reminderDate.getHours() - 1); // 1 hour before class

  const now = new Date();
  const delay = reminderDate.getTime() - now.getTime();

  if (delay > 0) {
    await addReminderJob(
      {
        type: 'CLASS_REMINDER',
        title: `⏰ Class Starting Soon: ${classTitle}`,
        message: `Your class will start in 1 hour at ${classDate.toLocaleTimeString()}`,
        relatedId: classId,
        scheduledFor: reminderDate,
        crId,
      },
      delay
    );
  }
};

export default reminderQueue;
