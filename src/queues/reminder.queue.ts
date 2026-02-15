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
  const now = new Date();

  // 1. Reminder: 1 day before deadline at 9 AM
  const dayBeforeReminder = new Date(deadline);
  dayBeforeReminder.setDate(dayBeforeReminder.getDate() - 1);
  dayBeforeReminder.setHours(9, 0, 0, 0);

  const dayBeforeDelay = dayBeforeReminder.getTime() - now.getTime();

  if (dayBeforeDelay > 0) {
    await addReminderJob(
      {
        type: 'ASSESSMENT_REMINDER',
        title: `Assessment Deadline Reminder: ${title} Due Tomorrow`,
        message: `This is a reminder that the assessment "${title}" is due tomorrow at ${deadline.toLocaleString()}. Please submit your work on time!`,
        relatedId: assessmentId,
        scheduledFor: dayBeforeReminder,
        crId,
      },
      dayBeforeDelay
    );
  }

  // 2. Reminder: 3 hours before deadline
  const threeHoursBeforeReminder = new Date(deadline);
  threeHoursBeforeReminder.setHours(threeHoursBeforeReminder.getHours() - 3);

  const threeHoursDelay = threeHoursBeforeReminder.getTime() - now.getTime();

  if (threeHoursDelay > 0) {
    await addReminderJob(
      {
        type: 'ASSESSMENT_REMINDER',
        title: `Urgent Assessment Alert: Submission Deadline for ${title} is Approaching`,
        message: `Urgent! The assessment "${title}" is due in 3 hours at ${deadline.toLocaleString()}.`,
        relatedId: assessmentId,
        scheduledFor: threeHoursBeforeReminder,
        crId,
      },
      threeHoursDelay
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
  reminderDate.setMinutes(reminderDate.getMinutes() - 15); // 15 minutes before class

  const now = new Date();
  const delay = reminderDate.getTime() - now.getTime();

  if (delay > 0) {
    await addReminderJob(
      {
        type: 'CLASS_REMINDER',
        title: `Upcoming Session Reminder: ${classTitle} Starts in 15 Minutes.`,
        message: `Your class for ${classTitle} is scheduled to start in 15 minutes at ${classDate.toLocaleTimeString('en-US', { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit' })}. Please be ready!`,
        relatedId: classId,
        scheduledFor: reminderDate,
        crId,
      },
      delay
    );
  }
};

export default reminderQueue;
