import { Request, Response } from 'express';
import httpStatus from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import pick from '../../utils/pick.utils';
import sendResponse from '../../utils/sendResponse';
import { ClassService } from './class.service';

const createClass = catchAsync(async (req: Request, res: Response) => {
  const { batchId, userId } = req.user;
  const result = await ClassService.createClass(
    {
      ...req.body,
      batchId: batchId || req.body.batchId,
      createdById: userId,
    },
    req.user,
    req
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Class created successfully',
    data: result,
  });
});

const getClassById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const classId = Array.isArray(id) ? id[0] : id;
  const result = await ClassService.getClassById(classId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Class fetched successfully',
    data: result,
  });
});

const getAllClasses = catchAsync(async (req: Request, res: Response) => {
  const { batchId } = req.user;
  const filters = pick(req.query, [
    'search',
    'batchId',
    'subjectId',
    'teacherId',
    'status',
    'classType',
    'classDate',
  ]);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);

  if (batchId) {
    filters.batchId = batchId;
  }

  const result = await ClassService.getAllClasses(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Classes fetched successfully',
    data: result.data,
    meta: result.pagination,
  });
});

const updateClass = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const classId = Array.isArray(id) ? id[0] : id;
  const result = await ClassService.updateClass(classId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Class updated successfully',
    data: result,
  });
});

const deleteClass = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const classId = Array.isArray(id) ? id[0] : id;
  await ClassService.deleteClass(classId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Class deleted successfully',
  });
});

export const ClassController = {
  createClass,
  getClassById,
  getAllClasses,
  updateClass,
  deleteClass,
};
