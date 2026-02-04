import { Request, Response } from 'express';
import httpStatus from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { TeacherService } from './teacher.service';

const createTeacher = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const result = await TeacherService.createTeacher({
    ...req.body,
    createdById: userId,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Teacher created successfully',
    data: result,
  });
});

const getTeacherById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const teacherId = Array.isArray(id) ? id[0] : id;
  const result = await TeacherService.getTeacherById(teacherId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Teacher fetched successfully',
    data: result,
  });
});

const getAllTeachers = catchAsync(async (req: Request, res: Response) => {
  const result = await TeacherService.getAllTeachers(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Teachers fetched successfully',
    data: result.data,
    meta: result.pagination,
  });
});

const updateTeacher = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const teacherId = Array.isArray(id) ? id[0] : id;
  const result = await TeacherService.updateTeacher(teacherId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Teacher updated successfully',
    data: result,
  });
});

const deleteTeacher = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const teacherId = Array.isArray(id) ? id[0] : id;
  await TeacherService.deleteTeacher(teacherId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Teacher deleted successfully',
  });
});

export const TeacherController = {
  createTeacher,
  getTeacherById,
  getAllTeachers,
  updateTeacher,
  deleteTeacher,
};
