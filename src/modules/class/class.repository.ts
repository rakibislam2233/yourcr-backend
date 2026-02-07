import { database } from '../../config/database.config';
import {
  createPaginationQuery,
  createPaginationResult,
  PaginationResult,
  parsePaginationOptions,
} from '../../utils/pagination.utils';
import { ICreateClassPayload, IUpdateClassPayload } from './class.interface';

const createClass = async (payload: ICreateClassPayload) => {
  return await database.class.create({
    data: {
      ...payload,
      classDate: new Date(payload.classDate),
      startTime: new Date(payload.startTime),
      endTime: new Date(payload.endTime),
    },
    include: {
      subject: true,
    },
  });
};

const getClassById = async (id: string) => {
  return await database.class.findUnique({
    where: { id },
    include: {
      subject: true,
      teacher: true,
      createdBy: true,
    },
  });
};

const getAllClasses = async (filters: any, options: any): Promise<PaginationResult<any>> => {
  const pagination = parsePaginationOptions(options);
  const { skip, take, orderBy } = createPaginationQuery(pagination);

  const where: any = { isDeleted: false };
  if (filters.subjectId) {
    where.subjectId = filters.subjectId;
  }
  if (filters.teacherId) {
    where.teacherId = filters.teacherId;
  }
  if (filters.status) {
    where.status = filters.status;
  }
  if (filters.classType) {
    where.classType = filters.classType;
  }
  if (filters.classDate) {
    where.classDate = new Date(filters.classDate);
  }
  if (filters.batchId) {
    where.batchId = filters.batchId;
  }

  const [classes, total] = await Promise.all([
    database.class.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        subject: true,
        teacher: true,
        createdBy: true,
      },
    }),
    database.class.count({ where }),
  ]);

  return createPaginationResult(classes, total, pagination);
};

const updateClass = async (id: string, payload: IUpdateClassPayload) => {
  return await database.class.update({
    where: { id },
    data: {
      ...payload,
      classDate: payload.classDate ? new Date(payload.classDate) : undefined,
      startTime: payload.startTime ? new Date(payload.startTime) : undefined,
      endTime: payload.endTime ? new Date(payload.endTime) : undefined,
    },
  });
};

const deleteClass = async (id: string) => {
  return await database.class.update({
    where: { id },
    data: { isDeleted: true },
  });
};

export const ClassRepository = {
  createClass,
  getClassById,
  getAllClasses,
  updateClass,
  deleteClass,
};
