import { Request, Response } from 'express';
import httpStatus from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { TeacherService } from './teacher.service';

import { uploadFile } from '../../utils/storage.utils';

const createTeacher = catchAsync(async (req: Request, res: Response) => {
  const { userId, batchId } = req.user;

  // Handle file upload
  let photoUrl = req.body.photoUrl;
  if (req.file) {
    const uploadResult = await uploadFile(req.file.buffer, 'teachers', `teacher_${Date.now()}`);
    photoUrl = uploadResult.secure_url;
  }

  const result = await TeacherService.createTeacher({
    ...req.body,
    photoUrl,
    batchId: batchId || req.body.batchId,
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
  const result = await TeacherService.getAllTeachers(req.query, req.user);

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

  // Handle file upload
  let photoUrl = req.body.photoUrl;
  if (req.file) {
    const uploadResult = await uploadFile(req.file.buffer, 'teachers', `teacher_${Date.now()}`);
    photoUrl = uploadResult.secure_url;
  }

  const result = await TeacherService.updateTeacher(teacherId, {
    ...req.body,
    photoUrl,
  });

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
