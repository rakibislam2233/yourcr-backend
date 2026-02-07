import { database } from '../../config/database.config';
import {
  createPaginationQuery,
  createPaginationResult,
  PaginationResult,
  parsePaginationOptions,
} from '../../utils/pagination.utils';
import { ICreateTeacherPayload, IUpdateTeacherPayload } from './teacher.interface';

const createTeacher = async (payload: ICreateTeacherPayload) => {
  return await database.teacher.create({
    data: payload,
  });
};

const getTeacherByEmail = async (email: string) => {
  return await database.teacher.findFirst({
    where: { email, isDeleted: false },
  });
};

const getTeacherById = async (id: string) => {
  return await database.teacher.findFirst({
    where: { id, isDeleted: false },
  });
};

const getAllTeachers = async (filters: any, options: any): Promise<PaginationResult<any>> => {
  const pagination = parsePaginationOptions(options);
  const { skip, take, orderBy } = createPaginationQuery(pagination);
  const where: any = { isDeleted: false };
  if (filters.batchId) where.batchId = filters.batchId;
  if (filters.department) where.department = { contains: filters.department, mode: 'insensitive' };
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } },
    ];
  }
  const [teachers, total] = await Promise.all([
    database.teacher.findMany({
      where,
      skip,
      take,
      orderBy,
    }),
    database.teacher.count({ where }),
  ]);

  return createPaginationResult(teachers, total, pagination);
};

const updateTeacher = async (id: string, payload: IUpdateTeacherPayload) => {
  return await database.teacher.update({
    where: { id, isDeleted: false },
    data: payload,
  });
};

const deleteTeacher = async (id: string) => {
  return await database.teacher.update({
    where: { id },
    data: { isDeleted: true },
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
