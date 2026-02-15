import { database } from '../../config/database.config';
import {
  createPaginationQuery,
  createPaginationResult,
  PaginationResult,
  parsePaginationOptions,
} from '../../utils/pagination.utils';
import { ICreateRoutinePayload, IUpdateRoutinePayload } from './routine.interface';

const createRoutine = async (payload: ICreateRoutinePayload) => {
  return await database.routine.create({
    data: payload,
  });
};

const getRoutineById = async (id: string) => {
  return await database.routine.findUnique({
    where: { id },
    include: {
      createdBy: true,
    },
  });
};

const getAllRoutines = async (filters: any, options: any): Promise<PaginationResult<any>> => {
  const pagination = parsePaginationOptions(options);
  const { skip, take, orderBy } = createPaginationQuery(pagination);

  const where: any = { isDeleted: false };
  if (filters.type) {
    where.type = filters.type;
  }
  if (filters.createdById) {
    where.createdById = filters.createdById;
  }
  if (filters.batchId) {
    where.batchId = filters.batchId;
  }
  if (filters.search) {
    where.OR = [{ name: { contains: filters.search, mode: 'insensitive' } }];
  }

  const [routines, total] = await Promise.all([
    database.routine.findMany({
      where,
      skip,
      take,
      orderBy,
    }),
    database.routine.count({ where }),
  ]);

  return createPaginationResult(routines, total, pagination);
};

const updateRoutine = async (id: string, payload: IUpdateRoutinePayload) => {
  return await database.routine.update({
    where: { id },
    data: payload,
  });
};

const deleteRoutine = async (id: string) => {
  return await database.routine.update({
    where: { id },
    data: { isDeleted: true },
  });
};

export const RoutineRepository = {
  createRoutine,
  getRoutineById,
  getAllRoutines,
  updateRoutine,
  deleteRoutine,
};
