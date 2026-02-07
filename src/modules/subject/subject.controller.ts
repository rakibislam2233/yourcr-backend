import { Request, Response } from 'express';
import httpStatus from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import pick from '../../utils/pick.utils';
import sendResponse from '../../utils/sendResponse';
import { SubjectService } from './subject.service';

const createSubject = catchAsync(async (req: Request, res: Response) => {
  const { userId, batchId } = req.user;
  const result = await SubjectService.createSubject({
    ...req.body,
    batchId: batchId || req.body.batchId,
    createdById: userId,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Subject created successfully',
    data: result,
  });
});

const getSubjectById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const subjectId = Array.isArray(id) ? id[0] : id;
  const result = await SubjectService.getSubjectById(subjectId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Subject fetched successfully',
    data: result,
  });
});

const getAllSubjects = catchAsync(async (req: Request, res: Response) => {
  const { batchId } = req.user;
  const filters = pick(req.query, ['search', 'batchId', 'teacherId', 'isDepartmental']);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);

  if (batchId) {
    filters.batchId = batchId;
  }

  const result = await SubjectService.getAllSubjects(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Subjects fetched successfully',
    data: result.data,
    meta: result.pagination,
  });
});

const updateSubject = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const subjectId = Array.isArray(id) ? id[0] : id;
  const result = await SubjectService.updateSubject(subjectId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Subject updated successfully',
    data: result,
  });
});

const deleteSubject = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const subjectId = Array.isArray(id) ? id[0] : id;
  await SubjectService.deleteSubject(subjectId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Subject deleted successfully',
  });
});

export const SubjectController = {
  createSubject,
  getSubjectById,
  getAllSubjects,
  updateSubject,
  deleteSubject,
};
