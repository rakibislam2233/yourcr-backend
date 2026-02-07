import { StatusCodes } from 'http-status-codes';
import { UserRole } from '../../shared/enum/user.enum';
import { IDecodedToken } from '../../shared/interfaces/jwt.interface';
import ApiError from '../../utils/ApiError';
import { ICreateRoutinePayload, IUpdateRoutinePayload } from './routine.interface';
import { RoutineRepository } from './routine.repository';

const createRoutine = async (payload: ICreateRoutinePayload, actor: IDecodedToken) => {
  if (actor.role === UserRole.CR) {
    payload.batchId = actor.batchId || undefined;
  }
  return await RoutineRepository.createRoutine(payload);
};

const getRoutineById = async (id: string) => {
  const routine = await RoutineRepository.getRoutineById(id);
  if (!routine) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Routine not found');
  }
  return routine;
};

const getAllRoutines = async (query: any, user: IDecodedToken) => {
  if (user.role === UserRole.CR || user.role === UserRole.STUDENT) {
    query.batchId = user.batchId;
  }
  return await RoutineRepository.getAllRoutines(query);
};

const updateRoutine = async (id: string, payload: IUpdateRoutinePayload) => {
  const existing = await RoutineRepository.getRoutineById(id);
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Routine not found');
  }
  return await RoutineRepository.updateRoutine(id, payload);
};

const deleteRoutine = async (id: string) => {
  const existing = await RoutineRepository.getRoutineById(id);
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Routine not found');
  }
  return await RoutineRepository.deleteRoutine(id);
};

export const RoutineService = {
  createRoutine,
  getRoutineById,
  getAllRoutines,
  updateRoutine,
  deleteRoutine,
};
