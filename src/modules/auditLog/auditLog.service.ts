import { StatusCodes } from 'http-status-codes';
import ApiError from '../../utils/ApiError';
import { ICreateAuditLogPayload } from './auditLog.interface';
import { AuditLogRepository } from './auditLog.repository';

const createAuditLog = async (payload: ICreateAuditLogPayload) => {
  return await AuditLogRepository.createAuditLog(payload);
};

const getAuditLogById = async (id: string) => {
  const log = await AuditLogRepository.getAuditLogById(id);
  if (!log) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Audit log not found');
  }
  return log;
};

const getAllAuditLogs = async (query: any) => {
  return await AuditLogRepository.getAllAuditLogs(query);
};

export const AuditLogService = {
  createAuditLog,
  getAuditLogById,
  getAllAuditLogs,
};
