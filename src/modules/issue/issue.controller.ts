import { Request, Response } from 'express';
import httpStatus from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import pick from '../../utils/pick.utils';
import sendResponse from '../../utils/sendResponse';
import { uploadFile } from '../../utils/storage.utils';
import { IssueService } from './issue.service';

const createIssue = catchAsync(async (req: Request, res: Response) => {
  const { userId, batchId } = req.user;

  // Handle file upload
  let fileUrl = req.body.fileUrl;
  if (req.file) {
    const uploadResult = await uploadFile(req.file.buffer, 'issues', `issue_${Date.now()}`);
    fileUrl = uploadResult.secure_url;
  }

  const result = await IssueService.createIssue(
    {
      ...req.body,
      fileUrl,
      studentId: userId,
      batchId: batchId || req.body.batchId,
    },
    userId,
    req
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Issue created successfully',
    data: result,
  });
});

const getIssueById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const issueId = Array.isArray(id) ? id[0] : id;
  const result = await IssueService.getIssueById(issueId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Issue fetched successfully',
    data: result,
  });
});

const getAllIssues = catchAsync(async (req: Request, res: Response) => {
  const { batchId } = req.user;
  const filters = pick(req.query, ['search', 'batchId', 'status', 'type', 'priority', 'studentId']);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);

  if (batchId) {
    filters.batchId = batchId;
  }

  const result = await IssueService.getAllIssues(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Issues fetched successfully',
    data: result.data,
    meta: result.pagination,
  });
});

const updateIssue = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = req.user;
  const issueId = Array.isArray(id) ? id[0] : id;

  // Handle file upload
  let fileUrl = req.body.fileUrl;
  if (req.file) {
    const uploadResult = await uploadFile(req.file.buffer, 'issues', `issue_${Date.now()}`);
    fileUrl = uploadResult.secure_url;
  }

  const result = await IssueService.updateIssue(
    issueId,
    {
      ...req.body,
      fileUrl: fileUrl,
    },
    userId,
    req
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Issue updated successfully',
    data: result,
  });
});

const deleteIssue = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const issueId = Array.isArray(id) ? id[0] : id;
  await IssueService.deleteIssue(issueId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Issue deleted successfully',
  });
});

export const IssueController = {
  createIssue,
  getIssueById,
  getAllIssues,
  updateIssue,
  deleteIssue,
};
