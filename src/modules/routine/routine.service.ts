import { StatusCodes } from 'http-status-codes';
import { IDecodedToken } from '../../shared/interfaces/jwt.interface';
import ApiError from '../../utils/ApiError';
import { ICreateRoutinePayload, IUpdateRoutinePayload } from './routine.interface';
import { RoutineRepository } from './routine.repository';

const createRoutine = async (payload: ICreateRoutinePayload, actor: IDecodedToken) => {
  return await RoutineRepository.createRoutine(payload);
};

const getRoutineById = async (id: string) => {
  const routine = await RoutineRepository.getRoutineById(id);
  if (!routine || (routine as any).isDeleted) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Routine not found');
  }
  return routine;
};

const getAllRoutines = async (filters: any, options: any) => {
  return await RoutineRepository.getAllRoutines(filters, options);
};

const updateRoutine = async (id: string, payload: IUpdateRoutinePayload) => {
  return await RoutineRepository.updateRoutine(id, payload);
};

const deleteRoutine = async (id: string) => {
  await RoutineService.getRoutineById(id);
  return await RoutineRepository.deleteRoutine(id);
};

export const RoutineService = {
  createRoutine,
  getRoutineById,
  getAllRoutines,
  updateRoutine,
  deleteRoutine,
};
