import { database } from '../../config/database.config';
import { ICreateAuditLogPayload } from './auditLog.interface';
import {
  createPaginationResult,
  PaginationResult,
  parsePaginationOptions,
  createPaginationQuery,
} from '../../utils/pagination.utils';

const createAuditLog = async (payload: ICreateAuditLogPayload) => {
  return await database.auditLog.create({
    data: {
      ...payload,
      metadata: payload.metadata as any,
    },
  });
};

const getAuditLogById = async (id: string) => {
  return await database.auditLog.findUnique({
    where: { id },
    include: {
      user: true,
    },
  });
};

const getAllAuditLogs = async (query: any): Promise<PaginationResult<any>> => {
  const pagination = parsePaginationOptions(query);
  const { skip, take, orderBy } = createPaginationQuery(pagination);

  const where: any = {};
  if (query.userId) {
    where.userId = query.userId;
  }
  if (query.entity) {
    where.entity = query.entity;
  }
  if (query.action) {
    where.action = query.action;
  }

  const [logs, total] = await Promise.all([
    database.auditLog.findMany({
      where,
      skip,
      take,
      orderBy,
      include: { user: true },
    }),
    database.auditLog.count({ where }),
  ]);

  return createPaginationResult(logs, total, pagination);
};

export const AuditLogRepository = {
  createAuditLog,
  getAuditLogById,
  getAllAuditLogs,
};
