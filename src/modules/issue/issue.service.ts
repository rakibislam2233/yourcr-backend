import { Request } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AuditAction } from '../../shared/enum/audit.enum';
import { UserRole } from '../../shared/enum/user.enum';
import ApiError from '../../utils/ApiError';
import { createAuditLog } from '../../utils/audit.helper';
import { UserRepository } from '../user/user.repository';
import { ICreateIssuePayload, IUpdateIssuePayload } from './issue.interface';
import { IssueRepository } from './issue.repository';

const createIssue = async (payload: ICreateIssuePayload, studentId: string, req?: Request) => {
  const student = await UserRepository.getUserById(studentId);
  if (!student || student.role !== UserRole.STUDENT) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Only students can create issues');
  }

  await createAuditLog(studentId, AuditAction.CREATE_ISSUE, 'Issue', undefined, { payload }, req);

  return await IssueRepository.createIssue(payload);
};

const getIssueById = async (id: string) => {
  const issue = await IssueRepository.getIssueById(id);
  if (!issue || (issue as any).isDeleted) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Issue not found');
  }
  return issue;
};

const getAllIssues = async (filters: any, options: any) => {
  return await IssueRepository.getAllIssues(filters, options);
};

const updateIssue = async (
  id: string,
  payload: IUpdateIssuePayload,
  resolverId?: string,
  req?: Request
) => {
  await IssueService.getIssueById(id);

  const data: IUpdateIssuePayload = { ...payload };
  if (payload.status === 'RESOLVED' && resolverId) {
    data.resolvedById = resolverId;
    data.resolvedAt = new Date().toISOString();
  }

  // Audit log for issue update/resolve
  if (resolverId) {
    await createAuditLog(resolverId, AuditAction.UPDATE_ISSUE, 'Issue', id, { payload }, req);
  }

  return await IssueRepository.updateIssue(id, data);
};

const deleteIssue = async (id: string) => {
  await IssueService.getIssueById(id);
  return await IssueRepository.deleteIssue(id);
};

export const IssueService = {
  createIssue,
  getIssueById,
  getAllIssues,
  updateIssue,
  deleteIssue,
};
