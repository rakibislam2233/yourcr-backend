import { StatusCodes } from 'http-status-codes';
import ApiError from '../../utils/ApiError';
import { ICreateIssuePayload, IUpdateIssuePayload } from './issue.interface';
import { IssueRepository } from './issue.repository';
import { UserRepository } from '../user/user.repository';
import { UserRole } from '../../shared/enum/user.enum';

const createIssue = async (payload: ICreateIssuePayload, studentId: string) => {
  const student = await UserRepository.getUserById(studentId);
  if (!student || student.role !== UserRole.STUDENT) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Only students can create issues');
  }

  return await IssueRepository.createIssue({
    ...payload,
    studentId,
  });
};

const getIssueById = async (id: string) => {
  const issue = await IssueRepository.getIssueById(id);
  if (!issue) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Issue not found');
  }
  return issue;
};

const getAllIssues = async (query: any) => {
  return await IssueRepository.getAllIssues(query);
};

const updateIssue = async (id: string, payload: IUpdateIssuePayload, resolverId?: string) => {
  const existing = await IssueRepository.getIssueById(id);
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Issue not found');
  }

  const data: IUpdateIssuePayload = { ...payload };
  if (payload.status === 'RESOLVED' && resolverId) {
    data.resolvedById = resolverId;
    data.resolvedAt = new Date().toISOString();
  }

  return await IssueRepository.updateIssue(id, data);
};

const deleteIssue = async (id: string) => {
  const existing = await IssueRepository.getIssueById(id);
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Issue not found');
  }
  return await IssueRepository.deleteIssue(id);
};

export const IssueService = {
  createIssue,
  getIssueById,
  getAllIssues,
  updateIssue,
  deleteIssue,
};
