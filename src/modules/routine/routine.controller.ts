import { Request, Response } from 'express';
import httpStatus from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { RoutineService } from './routine.service';

const createRoutine = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const result = await RoutineService.createRoutine({
    ...req.body,
    createdById: userId,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Routine created successfully',
    data: result,
  });
});

const getRoutineById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const routineId = Array.isArray(id) ? id[0] : id;
  const result = await RoutineService.getRoutineById(routineId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Routine fetched successfully',
    data: result,
  });
});

const getAllRoutines = catchAsync(async (req: Request, res: Response) => {
  const result = await RoutineService.getAllRoutines(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Routines fetched successfully',
    data: result.data,
    meta: result.pagination,
  });
});

const updateRoutine = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const routineId = Array.isArray(id) ? id[0] : id;
  const result = await RoutineService.updateRoutine(routineId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Routine updated successfully',
    data: result,
  });
});

const deleteRoutine = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const routineId = Array.isArray(id) ? id[0] : id;
  await RoutineService.deleteRoutine(routineId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Routine deleted successfully',
  });
});

export const RoutineController = {
  createRoutine,
  getRoutineById,
  getAllRoutines,
  updateRoutine,
  deleteRoutine,
};
