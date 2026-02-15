import { StatusCodes } from 'http-status-codes';
import { scheduleClassStatusUpdate } from '../../queues/classStatus.queue';
import { addNotificationJob } from '../../queues/notification.queue';
import { scheduleClassReminder } from '../../queues/reminder.queue';
import ApiError from '../../utils/ApiError';
import parseAmPmToDate, { getBangladeshTime, parseDateInBD } from '../../utils/time';
import { SubjectRepository } from '../subject/subject.repository';
import { TeacherRepository } from '../teacher/teacher.repository';
import { ICreateClassPayload, IUpdateClassPayload } from './class.interface';
import { ClassRepository } from './class.repository';

const createClass = async (payload: ICreateClassPayload) => {
  const baseDate = parseDateInBD(payload.classDate);
  const classStart = parseAmPmToDate(payload.startTime, baseDate);
  const classEnd = parseAmPmToDate(payload.endTime, baseDate);
  const now = getBangladeshTime();
  const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

  if (classStart < thirtyMinutesAgo) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Class can only be created up to 30 minutes before the start time'
    );
  }

  // Validate subject
  if (payload.subjectId) {
    const subject = await SubjectRepository.getSubjectById(payload.subjectId);
    if (!subject) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Subject not found');
    }
  }

  // Validate teacher
  if (payload.teacherId) {
    const teacher = await TeacherRepository.getTeacherById(payload.teacherId);
    if (!teacher) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Teacher not found');
    }
  }

  const classItem = await ClassRepository.createClass({
    ...payload,
    classDate: baseDate,
    startTime: classStart,
    endTime: classEnd,
  });

  // Immediate notification to students
  const locationDetails =
    classItem.classType === 'ONLINE'
      ? `Platform: ${classItem.platform || 'Online'}`
      : `Room: ${classItem.roomNumber || 'TBA'}`;

  const formattedDate = classItem.classDate.toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Dhaka',
  });

  const formattedTime = `${classStart.toLocaleTimeString('en-US', {
    timeZone: 'Asia/Dhaka',
    hour: '2-digit',
    minute: '2-digit',
  })} - ${classEnd.toLocaleTimeString('en-US', {
    timeZone: 'Asia/Dhaka',
    hour: '2-digit',
    minute: '2-digit',
  })}`;

  await addNotificationJob({
    title: `New Class Announcement: ${classItem.subject?.name || 'Academic Session'} Scheduled`,
    message: `A new class has been scheduled.\nSubject: ${classItem.subject?.name}\nDate: ${formattedDate}\nTime: ${formattedTime}\n${locationDetails}`,
    type: 'CLASS',
    relatedId: classItem.id,
    crId: payload.createdById,
  });

  // Schedule reminder 15 minutes before class
  await scheduleClassReminder(
    classItem.id,
    classStart,
    classItem.subject?.name || 'Class',
    payload.createdById
  );
  // Schedule automatic status updates
  await scheduleClassStatusUpdate(classItem.id, classStart, classEnd);

  return classItem;
};

const updateClass = async (id: string, payload: IUpdateClassPayload) => {
  const existingClass = await ClassService.getClassById(id);

  // Past date validation if date or time is being updated
  if (payload.classDate || payload.startTime) {
    const classDate = payload.classDate
      ? parseDateInBD(payload.classDate)
      : new Date((existingClass as any).classDate);

    const startTime = payload.startTime
      ? parseAmPmToDate(payload.startTime, classDate)
      : new Date((existingClass as any).startTime);

    const now = getBangladeshTime();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

    if (startTime < thirtyMinutesAgo) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Class can only be updated up to 30 minutes before the start time'
      );
    }
  }

  // Validate subject
  if (payload.subjectId) {
    const subject = await SubjectRepository.getSubjectById(payload.subjectId);
    if (!subject) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Subject not found');
    }
  }

  // Validate teacher
  if (payload.teacherId) {
    const teacher = await TeacherRepository.getTeacherById(payload.teacherId);
    if (!teacher) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Teacher not found');
    }
  }

  // ✅ Parse dates properly
  const updateData: any = { ...payload };

  // Determine the target date (new or existing)
  const targetDate = payload.classDate
    ? parseDateInBD(payload.classDate)
    : new Date((existingClass as any).classDate);

  // Helper to calculate the correct DateTime based on target date
  const getUpdatedTime = (
    timeInput: string | Date | undefined,
    existingTime: Date,
    dateBase: Date
  ) => {
    if (timeInput) {
      return parseAmPmToDate(timeInput, dateBase);
    }
    // If time not updated, preserve existing time on the target date
    const timeStr = existingTime.toLocaleTimeString('en-US', {
      timeZone: 'Asia/Dhaka',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    return parseAmPmToDate(timeStr, dateBase);
  };

  const finalStartTime = getUpdatedTime(
    payload.startTime,
    new Date((existingClass as any).startTime),
    targetDate
  );

  const finalEndTime = getUpdatedTime(
    payload.endTime,
    new Date((existingClass as any).endTime),
    targetDate
  );

  // Validate Start < End
  if (finalStartTime >= finalEndTime) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'End time must be after start time');
  }

  if (payload.classDate) {
    updateData.classDate = targetDate;
  }

  // Always update star/end times to ensure they match the (potentially new) date
  updateData.startTime = finalStartTime;
  updateData.endTime = finalEndTime;

  const updatedClass = await ClassRepository.updateClass(id, updateData);

  // Notify students about updates
  const changes: string[] = [];

  // 1. Date Change Check
  if (payload.classDate) {
    const oldDateStr = new Date((existingClass as any).classDate).toLocaleDateString('en-GB');
    const newDateStr = new Date(updateData.classDate).toLocaleDateString('en-GB');
    if (oldDateStr !== newDateStr) {
      changes.push(`Date changed to ${newDateStr}`);
    }
  }

  // 2. Time Change Check
  // Format times for comparison
  const formatTime = (d: Date) =>
    d.toLocaleTimeString('en-US', {
      timeZone: 'Asia/Dhaka',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

  const oldStart = formatTime(new Date((existingClass as any).startTime));
  const oldEnd = formatTime(new Date((existingClass as any).endTime));

  const newStart = formatTime(updateData.startTime);
  const newEnd = formatTime(updateData.endTime);
  if (oldStart !== newStart || oldEnd !== newEnd) {
    changes.push(`Time changed to ${newStart} - ${newEnd}`);
  }
  // 3. Other Field Changes
  if (payload.roomNumber && payload.roomNumber !== (existingClass as any).roomNumber) {
    changes.push(`Room changed to ${payload.roomNumber}`);
  }
  if (payload.platform && payload.platform !== (existingClass as any).platform) {
    changes.push(`Platform changed to ${payload.platform}`);
  }
  if (payload.status && payload.status !== (existingClass as any).status) {
    changes.push(`Status changed to ${payload.status}`);
  }

  // Construct a unified message
  const updateMessage = changes.length > 0 ? `Updates:\n${changes.join('\n')}` : ''; // If no changes detected (e.g. redundant update), message will be empty

  // Only send notification if there are actual changes
  if (changes.length > 0) {
    await addNotificationJob({
      title: `Class Update Notification: Changes to ${(existingClass as any).subject?.name || 'Class Session'}`,
      message: `The class for ${(existingClass as any).subject?.name} has been updated.\n${updateMessage}`,
      type: 'CLASS_UPDATE',
      relatedId: id,
      crId: (existingClass as any).createdById,
    });

    // Reschedule if time changed
    if (payload.startTime || payload.classDate || payload.endTime) {
      const newStartTime = updateData.startTime || new Date((existingClass as any).startTime);
      const newEndTime = updateData.endTime || new Date((existingClass as any).endTime);

      await scheduleClassReminder(
        updatedClass.id,
        newStartTime,
        (existingClass as any).subject?.name || 'Class',
        (updatedClass as any).createdById
      );

      await scheduleClassStatusUpdate(updatedClass.id, newStartTime, newEndTime);
    }
  }

  return updatedClass;
};

const getClassById = async (id: string) => {
  const classItem = await ClassRepository.getClassById(id);
  if (!classItem || (classItem as any).isDeleted) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Class not found');
  }
  return classItem;
};

const getAllClasses = async (filters: any, options: any) => {
  return await ClassRepository.getAllClasses(filters, options);
};

const deleteClass = async (id: string) => {
  await ClassService.getClassById(id);
  return await ClassRepository.deleteClass(id);
};

export const ClassService = {
  createClass,
  getClassById,
  getAllClasses,
  updateClass,
  deleteClass,
};
