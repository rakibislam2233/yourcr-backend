import { Request, Response } from 'express';
import httpStatus from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AuditLogService } from './auditLog.service';

const getAuditLogById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const logId = Array.isArray(id) ? id[0] : id;
  const result = await AuditLogService.getAuditLogById(logId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Audit log fetched successfully',
    data: result,
  });
});

const getAllAuditLogs = catchAsync(async (req: Request, res: Response) => {
  const result = await AuditLogService.getAllAuditLogs(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Audit logs fetched successfully',
    data: result.data,
    meta: result.pagination,
  });
});

export const AuditLogController = {
  getAuditLogById,
  getAllAuditLogs,
};
