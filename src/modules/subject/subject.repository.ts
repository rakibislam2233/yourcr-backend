import { database } from '../../config/database.config';
import { ICreateSubjectPayload, IUpdateSubjectPayload } from './subject.interface';
import {
  createPaginationResult,
  PaginationResult,
  parsePaginationOptions,
  createPaginationQuery,
} from '../../utils/pagination.utils';

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

const getAllSubjects = async (query: any): Promise<PaginationResult<any>> => {
  const pagination = parsePaginationOptions(query);
  const { skip, take, orderBy } = createPaginationQuery(pagination);

  const where: any = { isDeleted: false };
  if (query.teacherId) {
    where.teacherId = query.teacherId;
  }
  if (query.isDepartmental !== undefined) {
    where.isDepartmental = query.isDepartmental === 'true' || query.isDepartmental === true;
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
