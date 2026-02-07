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

const getAllRoutines = async (query: any): Promise<PaginationResult<any>> => {
  const pagination = parsePaginationOptions(query);
  const { skip, take, orderBy } = createPaginationQuery(pagination);

  const where: any = {};
  if (query.type) {
    where.type = query.type;
  }
  if (query.createdById) {
    where.createdById = query.createdById;
  }
  if (query.batchId) {
    where.batchId = query.batchId;
  }

  const [routines, total] = await Promise.all([
    database.routine.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        createdBy: true,
      },
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
  return await database.routine.delete({
    where: { id },
  });
};

export const RoutineRepository = {
  createRoutine,
  getRoutineById,
  getAllRoutines,
  updateRoutine,
  deleteRoutine,
};
