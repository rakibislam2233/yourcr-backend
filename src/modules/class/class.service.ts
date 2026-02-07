import { StatusCodes } from 'http-status-codes';
import { addNotificationJob } from '../../queues/notification.queue';
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

  // Notify students under this CR
  await addNotificationJob({
    title: `New Class: ${classItem.subject?.name || 'Class'} on ${classItem.classDate.toDateString()}`,
    message: `Class scheduled at ${new Date(classItem.startTime).toLocaleTimeString()} - ${new Date(classItem.endTime).toLocaleTimeString()}`,
    type: 'NOTICE',
    relatedId: classItem.id,
    crId: payload.createdById,
  });

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
  await ClassService.getClassById(id);

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

  return await ClassRepository.updateClass(id, payload);
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
