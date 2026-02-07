import { StatusCodes } from 'http-status-codes';
import { addNotificationJob } from '../../queues/notification.queue';
import { scheduleClassReminder } from '../../queues/reminder.queue';
import ApiError from '../../utils/ApiError';
import { SubjectRepository } from '../subject/subject.repository';
import { TeacherRepository } from '../teacher/teacher.repository';
import { ICreateClassPayload, IUpdateClassPayload } from './class.interface';
import { ClassRepository } from './class.repository';

const createClass = async (payload: ICreateClassPayload) => {
  if (payload.subjectId) {
    const subject = await SubjectRepository.getSubjectById(payload.subjectId);
    if (!subject) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Subject not found');
    }
  }

  if (payload.teacherId) {
    const teacher = await TeacherRepository.getTeacherById(payload.teacherId);
    if (!teacher) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Teacher not found');
    }
  }

  const classItem = await ClassRepository.createClass(payload);

  // Immediate notification to students
  await addNotificationJob({
    title: `New Class: ${classItem.subject?.name || 'Class'} on ${classItem.classDate.toDateString()}`,
    message: `Class scheduled at ${new Date(classItem.startTime).toLocaleTimeString()} - ${new Date(classItem.endTime).toLocaleTimeString()}`,
    type: 'NOTICE',
    relatedId: classItem.id,
    crId: payload.createdById,
  });

  // Schedule reminder 1 hour before class
  await scheduleClassReminder(
    classItem.id,
    new Date(classItem.startTime),
    classItem.subject?.name || 'Class',
    payload.createdById
  );

  return classItem;
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

const updateClass = async (id: string, payload: IUpdateClassPayload) => {
  const existingClass = await ClassService.getClassById(id);

  if (payload.subjectId) {
    const subject = await SubjectRepository.getSubjectById(payload.subjectId);
    if (!subject) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Subject not found');
    }
  }

  if (payload.teacherId) {
    const teacher = await TeacherRepository.getTeacherById(payload.teacherId);
    if (!teacher) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Teacher not found');
    }
  }

  const updatedClass = await ClassRepository.updateClass(id, payload);

  // Notify students about the update
  const changes: string[] = [];
  if (payload.classDate) changes.push('date');
  if (payload.startTime) changes.push('time');
  if (payload.status) changes.push('status');
  if (payload.classType) changes.push('type');

  if (changes.length > 0) {
    await addNotificationJob({
      title: `Class Updated: ${(existingClass as any).subject?.name || 'Class'}`,
      message: `Class details have been updated (${changes.join(', ')}). Please check the latest information.`,
      type: 'NOTICE',
      relatedId: id,
      crId: (existingClass as any).createdById,
    });

    // Reschedule reminder if time changed
    if (payload.startTime || payload.classDate) {
      await scheduleClassReminder(
        updatedClass.id,
        new Date(updatedClass.startTime),
        (updatedClass as any).subject?.name || 'Class',
        (updatedClass as any).createdById
      );
    }
  }

  return updatedClass;
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
