import { StatusCodes } from 'http-status-codes';
import ApiError from '../../utils/ApiError';
import { TeacherRepository } from '../teacher/teacher.repository';
import { ICreateSubjectPayload, IUpdateSubjectPayload } from './subject.interface';
import { SubjectRepository } from './subject.repository';

const createSubject = async (payload: ICreateSubjectPayload) => {
  if (payload.teacherId) {
    const teacher = await TeacherRepository.getTeacherById(payload.teacherId);
    if (!teacher) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Teacher not found');
    }
  }

  return await SubjectRepository.createSubject(payload);
};

const getSubjectById = async (id: string) => {
  const subject = await SubjectRepository.getSubjectById(id);
  if (!subject || subject.isDeleted) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Subject not found');
  }
  return subject;
};

const getAllSubjects = async (query: any) => {
  return await SubjectRepository.getAllSubjects(query);
};

const updateSubject = async (id: string, payload: IUpdateSubjectPayload) => {
  const existing = await SubjectRepository.getSubjectById(id);
  if (!existing || existing.isDeleted) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Subject not found');
  }

  if (payload.teacherId) {
    const teacher = await TeacherRepository.getTeacherById(payload.teacherId);
    if (!teacher) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Teacher not found');
    }
  }

  return await SubjectRepository.updateSubject(id, payload);
};

const deleteSubject = async (id: string) => {
  const existing = await SubjectRepository.getSubjectById(id);
  if (!existing || existing.isDeleted) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Subject not found');
  }
  return await SubjectRepository.deleteSubject(id);
};

export const SubjectService = {
  createSubject,
  getSubjectById,
  getAllSubjects,
  updateSubject,
  deleteSubject,
};
