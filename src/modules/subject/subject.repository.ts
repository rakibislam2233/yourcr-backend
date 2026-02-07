import { database } from '../../config/database.config';
import {
  createPaginationQuery,
  createPaginationResult,
  PaginationResult,
  parsePaginationOptions,
} from '../../utils/pagination.utils';
import { ICreateSubjectPayload, IUpdateSubjectPayload } from './subject.interface';

const createSubject = async (payload: ICreateSubjectPayload) => {
  return await database.subject.create({
    data: payload,
  });
};

const getSubjectById = async (id: string) => {
  return await database.subject.findUnique({
    where: { id },
    include: {
      teacher: true,
      createdBy: true,
    },
  });
};

const getAllSubjects = async (filters: any, options: any): Promise<PaginationResult<any>> => {
  const pagination = parsePaginationOptions(options);
  const { skip, take, orderBy } = createPaginationQuery(pagination);

  const where: any = { isDeleted: false };
  if (filters.teacherId) {
    where.teacherId = filters.teacherId;
  }
  if (filters.isDepartmental !== undefined) {
    where.isDepartmental = filters.isDepartmental === 'true' || filters.isDepartmental === true;
  }
  if (filters.batchId) {
    where.batchId = filters.batchId;
  }
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { code: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const [subjects, total] = await Promise.all([
    database.subject.findMany({
      where,
      include: {
        teacher: true,
        createdBy: true,
      },
      skip,
      take,
      orderBy,
    }),
    database.subject.count({ where }),
  ]);

  return createPaginationResult(subjects, total, pagination);
};

const updateSubject = async (id: string, payload: IUpdateSubjectPayload) => {
  return await database.subject.update({
    where: { id },
    data: payload,
  });
};

const deleteSubject = async (id: string) => {
  return await database.subject.update({
    where: { id },
    data: { isDeleted: true },
  });
};

export const SubjectRepository = {
  createSubject,
  getSubjectById,
  getAllSubjects,
  updateSubject,
  deleteSubject,
};
