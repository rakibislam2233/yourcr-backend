import { Request, Response } from 'express';
import httpStatus from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { IssueService } from './issue.service';

const createIssue = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const result = await IssueService.createIssue(req.body, userId, req);

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
  const result = await IssueService.getAllIssues(req.query);

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
  const result = await IssueService.updateIssue(issueId, req.body, userId, req);

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
