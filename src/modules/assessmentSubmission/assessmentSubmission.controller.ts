import { Request, Response } from 'express';
import httpStatus from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import pick from '../../utils/pick.utils';
import sendResponse from '../../utils/sendResponse';
import { uploadFile } from '../../utils/storage.utils';
import { AssessmentSubmissionService } from './assessmentSubmission.service';

const submitAssessment = catchAsync(async (req: Request, res: Response) => {
  const { userId, batchId } = req.user;

  const fileUrls: string[] = [];
  if (req.files && Array.isArray(req.files)) {
    for (const file of req.files) {
      const uploadResult = await uploadFile(file.buffer, 'submissions', `submission_${Date.now()}`);
      fileUrls.push(uploadResult.secure_url);
    }
  }

  const result = await AssessmentSubmissionService.submitAssessment(
    {
      ...req.body,
      fileUrls: fileUrls.length > 0 ? fileUrls : req.body.fileUrls,
      batchId: batchId || req.body.batchId,
      studentId: userId,
    },
    userId,
    req
  );

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
  const filters = pick(req.query, ['assessmentId']);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);

  const result = await AssessmentSubmissionService.getMySubmissions(userId, filters, options);

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

  const fileUrls: string[] = [];
  if (req.files && Array.isArray(req.files)) {
    for (const file of req.files) {
      const uploadResult = await uploadFile(file.buffer, 'submissions', `submission_${Date.now()}`);
      fileUrls.push(uploadResult.secure_url);
    }
  }

  const result = await AssessmentSubmissionService.updateSubmission(
    submissionId,
    {
      ...req.body,
      fileUrls: fileUrls.length > 0 ? fileUrls : req.body.fileUrls,
    },
    userId
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Submission updated successfully',
    data: result,
  });
});

const getAllSubmissions = catchAsync(async (req: Request, res: Response) => {
  const { batchId } = req.user;
  const filters = pick(req.query, ['assessmentId', 'studentId', 'batchId']);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);

  if (batchId) {
    filters.batchId = batchId;
  }

  const result = await AssessmentSubmissionService.getAllSubmissions(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Submissions fetched successfully',
    data: result.data,
    meta: result.pagination,
  });
});

export const AssessmentSubmissionController = {
  submitAssessment,
  getSubmissionById,
  getMySubmissions,
  getAllSubmissions,
  updateSubmission,
};
