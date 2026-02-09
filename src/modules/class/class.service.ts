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
  await addNotificationJob({
    title: `New Class: ${classItem.subject?.name || 'Class'} on  ${classItem.classDate.toLocaleDateString('en-GB', { timeZone: 'Asia/Dhaka' })}`,
    message: `Class scheduled at ${classStart.toLocaleTimeString('en-US', { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit' })} - ${classEnd.toLocaleTimeString('en-US', { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit' })}`,
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
  if (payload.classDate) {
    updateData.classDate = parseDateInBD(payload.classDate);
  }
  if (payload.startTime && payload.classDate) {
    updateData.startTime = parseAmPmToDate(payload.startTime, updateData.classDate);
  }
  if (payload.endTime && payload.classDate) {
    updateData.endTime = parseAmPmToDate(payload.endTime, updateData.classDate);
  }

  const updatedClass = await ClassRepository.updateClass(id, updateData);

  // Notify students about updates
  const changes: string[] = [];
  if (payload.classDate) changes.push('date');
  if (payload.startTime) changes.push('time');
  if (payload.status) changes.push('status');
  if (payload.classType) changes.push('type');

  if (changes.length > 0) {
    await addNotificationJob({
      title: `Class Updated: ${(existingClass as any).subject?.name || 'Class'}`,
      message: `The following class details have been updated: ${changes.join(', ')}.`,
      type: 'CLASS_UPDATE',
      relatedId: id,
      crId: (existingClass as any).createdById,
    });

    // Reschedule if time changed
    if (payload.startTime || payload.classDate || payload.endTime) {
      await scheduleClassReminder(
        updatedClass.id,
        new Date(updatedClass.startTime),
        (updatedClass as any).subject?.name || 'Class',
        (updatedClass as any).createdById
      );

      await scheduleClassStatusUpdate(
        updatedClass.id,
        new Date(updatedClass.startTime),
        new Date(updatedClass.endTime)
      );
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
