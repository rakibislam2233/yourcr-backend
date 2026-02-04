import { Request, Response } from 'express';
import httpStatus from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AssessmentSubmissionService } from './assessmentSubmission.service';

const submitAssessment = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const result = await AssessmentSubmissionService.submitAssessment(req.body, userId, req);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Assessment submitted successfully',
    data: result,
  });
});

const getSubmissionById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const submissionId = Array.isArray(id) ? id[0] : id;
  const result = await AssessmentSubmissionService.getSubmissionById(submissionId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Submission fetched successfully',
    data: result,
  });
});

const getMySubmissions = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const result = await AssessmentSubmissionService.getMySubmissions(userId, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Submissions fetched successfully',
    data: result.data,
    meta: result.pagination,
  });
});

const updateSubmission = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = req.user;
  const submissionId = Array.isArray(id) ? id[0] : id;
  const result = await AssessmentSubmissionService.updateSubmission(submissionId, req.body, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Submission updated successfully',
    data: result,
  });
});

export const AssessmentSubmissionController = {
  submitAssessment,
  getSubmissionById,
  getMySubmissions,
  updateSubmission,
};
