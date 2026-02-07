import { Request, Response } from 'express';
import httpStatus from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ClassService } from './class.service';

const createClass = catchAsync(async (req: Request, res: Response) => {
  const result = await ClassService.createClass(req.body, req.user, req);

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
  const result = await ClassService.getAllClasses(req.query, req.user);

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
