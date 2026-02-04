import { Request, Response } from 'express';
import httpStatus from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AssessmentService } from './assessment.service';

const createAssessment = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const result = await AssessmentService.createAssessment(req.body, userId, req);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Assessment created successfully',
    data: result,
  });
});

const getAssessmentById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const assessmentId = Array.isArray(id) ? id[0] : id;
  const result = await AssessmentService.getAssessmentById(assessmentId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Assessment fetched successfully',
    data: result,
  });
});

const getAllAssessments = catchAsync(async (req: Request, res: Response) => {
  const result = await AssessmentService.getAllAssessments(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Assessments fetched successfully',
    data: result.data,
    meta: result.pagination,
  });
});

const updateAssessment = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const assessmentId = Array.isArray(id) ? id[0] : id;
  const result = await AssessmentService.updateAssessment(assessmentId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Assessment updated successfully',
    data: result,
  });
});

const deleteAssessment = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const assessmentId = Array.isArray(id) ? id[0] : id;
  await AssessmentService.deleteAssessment(assessmentId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Assessment deleted successfully',
  });
});

export const AssessmentController = {
  createAssessment,
  getAssessmentById,
  getAllAssessments,
  updateAssessment,
  deleteAssessment,
};
