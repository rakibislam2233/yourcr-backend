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

const getAllClasses = async (query: any): Promise<PaginationResult<any>> => {
  const pagination = parsePaginationOptions(query);
  const { skip, take, orderBy } = createPaginationQuery(pagination);

  const where: any = {};
  if (query.subjectId) {
    where.subjectId = query.subjectId;
  }
  if (query.teacherId) {
    where.teacherId = query.teacherId;
  }
  if (query.status) {
    where.status = query.status;
  }
  if (query.classType) {
    where.classType = query.classType;
  }
  if (query.classDate) {
    where.classDate = new Date(query.classDate);
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
  return await database.class.delete({
    where: { id },
  });
};

export const ClassRepository = {
  createClass,
  getClassById,
  getAllClasses,
  updateClass,
  deleteClass,
};
