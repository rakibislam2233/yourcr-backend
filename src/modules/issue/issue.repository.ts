import { database } from '../../config/database.config';
import { ICreateIssuePayload, IUpdateIssuePayload } from './issue.interface';
import {
  createPaginationResult,
  PaginationResult,
  parsePaginationOptions,
  createPaginationQuery,
} from '../../utils/pagination.utils';

const createIssue = async (payload: ICreateIssuePayload) => {
  return await database.issue.create({
    data: payload,
  });
};

const getIssueById = async (id: string) => {
  return await database.issue.findUnique({
    where: { id },
    include: {
      student: true,
      resolvedBy: true,
    },
  });
};

const getAllIssues = async (query: any): Promise<PaginationResult<any>> => {
  const pagination = parsePaginationOptions(query);
  const { skip, take, orderBy } = createPaginationQuery(pagination);

  const where: any = {};
  if (query.status) {
    where.status = query.status;
  }
  if (query.type) {
    where.type = query.type;
  }
  if (query.priority) {
    where.priority = query.priority;
  }
  if (query.studentId) {
    where.studentId = query.studentId;
  }

  const [issues, total] = await Promise.all([
    database.issue.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        student: true,
        resolvedBy: true,
      },
    }),
    database.issue.count({ where }),
  ]);

  return createPaginationResult(issues, total, pagination);
};

const updateIssue = async (id: string, payload: IUpdateIssuePayload) => {
  return await database.issue.update({
    where: { id },
    data: {
      ...payload,
      resolvedAt: payload.resolvedAt ? new Date(payload.resolvedAt) : undefined,
    },
  });
};

const deleteIssue = async (id: string) => {
  return await database.issue.delete({
    where: { id },
  });
};

export const IssueRepository = {
  createIssue,
  getIssueById,
  getAllIssues,
  updateIssue,
  deleteIssue,
};
