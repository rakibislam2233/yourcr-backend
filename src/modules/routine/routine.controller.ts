import { Request, Response } from 'express';
import httpStatus from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import pick from '../../utils/pick.utils';
import sendResponse from '../../utils/sendResponse';
import { uploadFile } from '../../utils/storage.utils';
import { RoutineService } from './routine.service';

const createRoutine = catchAsync(async (req: Request, res: Response) => {
  const { batchId, userId } = req.user;

  let fileUrl = req.body.fileUrl;
  if (req.file) {
    const uploadResult = await uploadFile(req.file.buffer, 'routines', `routine_${Date.now()}`);
    fileUrl = uploadResult.secure_url;
  }

  const result = await RoutineService.createRoutine(
    {
      ...req.body,
      fileUrl: fileUrl || req.body.fileUrl,
      batchId: batchId || req.body.batchId,
      createdById: userId,
    },
    req.user
  );

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
  const { batchId } = req.user;
  const filters = pick(req.query, ['search', 'batchId', 'type', 'createdById']);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);

  if (batchId) {
    filters.batchId = batchId;
  }

  const result = await RoutineService.getAllRoutines(filters, options);

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

  let fileUrl = req.body.fileUrl;
  if (req.file) {
    const uploadResult = await uploadFile(req.file.buffer, 'routines', `routine_${Date.now()}`);
    fileUrl = uploadResult.secure_url;
  }

  const result = await RoutineService.updateRoutine(routineId, {
    ...req.body,
    fileUrl: fileUrl,
  });

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
