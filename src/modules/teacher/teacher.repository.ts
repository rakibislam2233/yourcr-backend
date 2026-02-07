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
  return await database.teacher.findUnique({
    where: { email },
  });
};

const getTeacherById = async (id: string) => {
  return await database.teacher.findUnique({
    where: { id },
    include: {
      subjects: true,
      createdBy: true,
    },
  });
};

const getAllTeachers = async (query: any): Promise<PaginationResult<any>> => {
  const pagination = parsePaginationOptions(query);
  const { skip, take, orderBy } = createPaginationQuery(pagination);

  const where: any = {};
  if (query.batchId) where.batchId = query.batchId;
  if (query.department) where.department = { contains: query.department, mode: 'insensitive' };
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { email: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  const [teachers, total] = await Promise.all([
    database.teacher.findMany({
      where,
      include: {
        subjects: true,
        createdBy: true,
      },
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
