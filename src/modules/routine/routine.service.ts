import { StatusCodes } from 'http-status-codes';
import ApiError from '../../utils/ApiError';
import { ICreateRoutinePayload, IUpdateRoutinePayload } from './routine.interface';
import { RoutineRepository } from './routine.repository';

const createRoutine = async (payload: ICreateRoutinePayload) => {
  return await RoutineRepository.createRoutine(payload);
};

const getRoutineById = async (id: string) => {
  const routine = await RoutineRepository.getRoutineById(id);
  if (!routine) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Routine not found');
  }
  return routine;
};

const getAllRoutines = async (query: any) => {
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
