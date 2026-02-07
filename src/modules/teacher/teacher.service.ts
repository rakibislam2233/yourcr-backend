import { StatusCodes } from 'http-status-codes';
import ApiError from '../../utils/ApiError';
import { ICreateTeacherPayload, IUpdateTeacherPayload } from './teacher.interface';
import { TeacherRepository } from './teacher.repository';

const createTeacher = async (payload: ICreateTeacherPayload) => {
  if (payload.email) {
    const existing = await TeacherRepository.getTeacherByEmail(payload.email);
    if (existing) {
      throw new ApiError(StatusCodes.CONFLICT, 'Teacher with this email already exists');
    }
  }
  return await TeacherRepository.createTeacher(payload);
};

const getTeacherById = async (id: string) => {
  const teacher = await TeacherRepository.getTeacherById(id);
  if (!teacher) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Teacher not found');
  }
  return teacher;
};

const getAllTeachers = async (filters: any, options: any) => {
  return await TeacherRepository.getAllTeachers(filters, options);
};

const updateTeacher = async (id: string, payload: IUpdateTeacherPayload) => {
  const existing = await TeacherRepository.getTeacherById(id);
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Teacher not found');
  }

  if (payload.email) {
    const emailOwner = await TeacherRepository.getTeacherByEmail(payload.email);
    if (emailOwner && emailOwner.id !== id) {
      throw new ApiError(StatusCodes.CONFLICT, 'Teacher with this email already exists');
    }
  }

  return await TeacherRepository.updateTeacher(id, payload);
};

const deleteTeacher = async (id: string) => {
  const existing = await TeacherRepository.getTeacherById(id);
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Teacher not found');
  }
  return await TeacherRepository.deleteTeacher(id);
};

export const TeacherService = {
  createTeacher,
  getTeacherById,
  getAllTeachers,
  updateTeacher,
  deleteTeacher,
};
