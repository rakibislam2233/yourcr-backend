import { database } from '../../config/database.config';
import { ICreateTeacherPayload, IUpdateTeacherPayload } from './teacher.interface';

const createTeacher = async (payload: ICreateTeacherPayload) => {
  return await database.teacher.create({
    data: payload,
  });
};

const getTeacherByEmail = async (email: string) => {
  return await database.teacher.findUnique({
    where: { email },
  });
};

const getTeacherById = async (id: string) => {
  return await database.teacher.findUnique({
    where: { id },
    include: {
      subjects: true,
    },
  });
};

const getAllTeachers = async () => {
  return await database.teacher.findMany({
    include: {
      subjects: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

const updateTeacher = async (id: string, payload: IUpdateTeacherPayload) => {
  return await database.teacher.update({
    where: { id },
    data: payload,
  });
};

const deleteTeacher = async (id: string) => {
  return await database.teacher.delete({
    where: { id },
  });
};

export const TeacherRepository = {
  createTeacher,
  getTeacherByEmail,
  getTeacherById,
  getAllTeachers,
  updateTeacher,
  deleteTeacher,
};
