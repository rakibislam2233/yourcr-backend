import { database } from '../../config/database.config';
import {
  createPaginationQuery,
  createPaginationResult,
  PaginationResult,
  parsePaginationOptions,
} from '../../utils/pagination.utils';
import { ICreateIssuePayload, IUpdateIssuePayload } from './issue.interface';

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

const getAllIssues = async (filters: any, options: any): Promise<PaginationResult<any>> => {
  const pagination = parsePaginationOptions(options);
  const { skip, take, orderBy } = createPaginationQuery(pagination);

  const where: any = { isDeleted: false };
  if (filters.status) {
    where.status = filters.status;
  }
  if (filters.type) {
    where.type = filters.type;
  }
  if (filters.priority) {
    where.priority = filters.priority;
  }
  if (filters.studentId) {
    where.studentId = filters.studentId;
  }
  if (filters.batchId) {
    where.batchId = filters.batchId;
  }
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
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
  return await database.issue.update({
    where: { id },
    data: { isDeleted: true },
  });
};

export const IssueRepository = {
  createIssue,
  getIssueById,
  getAllIssues,
  updateIssue,
  deleteIssue,
};
