import colors from 'colors';
import { database } from '../config/database.config';
import { scheduleClassStatusUpdate } from '../queues/classStatus.queue';
import logger from './logger';


export const rescheduleAllClassStatusUpdates = async () => {
  try {
    logger.info(colors.blue('🔄 Rescheduling class status updates...'));
    const now = new Date();
    const upcomingClasses = await database.class.findMany({
      where: {
        status: 'SCHEDULED',
        isDeleted: false,
        startTime: {
          gte: now,
        },
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
      },
    });

    logger.info(colors.cyan(`   Found ${upcomingClasses.length} upcoming classes`));
    for (const classItem of upcomingClasses) {
      await scheduleClassStatusUpdate(
        classItem.id,
        new Date(classItem.startTime),
        new Date(classItem.endTime)
      );
    }
    const ongoingClasses = await database.class.findMany({
      where: {
        status: 'ONGOING',
        isDeleted: false,
        endTime: {
          gte: now, // End time is in the future
        },
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
      },
    });

    logger.info(colors.cyan(`   Found ${ongoingClasses.length} ongoing classes`));
    for (const classItem of ongoingClasses) {
      const endDelay = new Date(classItem.endTime).getTime() - now.getTime();
      if (endDelay > 0) {
        await scheduleClassStatusUpdate(
          classItem.id,
          new Date(classItem.startTime),
          new Date(classItem.endTime)
        );
      }
    }
    logger.info(
      colors.green(
        `✅ Rescheduled status updates for ${upcomingClasses.length + ongoingClasses.length} classes`
      )
    );
  } catch (error) {
    logger.error(colors.red('❌ Failed to reschedule class status updates:'), error);
  }
};
