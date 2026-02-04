import { StatusCodes } from 'http-status-codes';
import ApiError from '../../utils/ApiError';
import { ICreateClassPayload, IUpdateClassPayload } from './class.interface';
import { ClassRepository } from './class.repository';
import { SubjectRepository } from '../subject/subject.repository';
import { TeacherRepository } from '../teacher/teacher.repository';

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

  return await ClassRepository.createClass(payload);
};

const getClassById = async (id: string) => {
  const classItem = await ClassRepository.getClassById(id);
  if (!classItem) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Class not found');
  }
  return classItem;
};

const getAllClasses = async (query: any) => {
  return await ClassRepository.getAllClasses(query);
};

const updateClass = async (id: string, payload: IUpdateClassPayload) => {
  const existing = await ClassRepository.getClassById(id);
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Class not found');
  }

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
  const existing = await ClassRepository.getClassById(id);
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Class not found');
  }
  return await ClassRepository.deleteClass(id);
};

export const ClassService = {
  createClass,
  getClassById,
  getAllClasses,
  updateClass,
  deleteClass,
};
