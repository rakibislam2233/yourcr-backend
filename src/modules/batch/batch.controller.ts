import { Request, Response } from 'express';
import httpStatus from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { BatchService } from './batch.service';
import ApiError from '../../utils/ApiError';
import { UserRole } from '../../shared/enum/user.enum';

// ── Batch Controllers ───────────────────────────────────────────────────
const createBatch = catchAsync(async (req: Request, res: Response) => {
  const result = await BatchService.createBatch(req.body, req);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Batch created successfully',
    data: result,
  });
});

const getBatchById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const batchId = Array.isArray(id) ? id[0] : id;

  const result = await BatchService.getBatchById(batchId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Batch fetched successfully',
    data: result,
  });
});

const getAllBatches = catchAsync(async (req: Request, res: Response) => {
  const filters = {
    institutionId: req.query.institutionId,
    department: req.query.department,
    batchType: req.query.batchType,
    isActive: req.query.isActive,
    isArchived: req.query.isArchived,
    search: req.query.search,
  };

  const options = {
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 10,
    sortBy: (req.query.sortBy as string) || 'createdAt',
    sortOrder: (req.query.sortOrder as string) || 'desc',
  };

  const result = await BatchService.getAllBatches(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Batches fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const updateBatch = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId, role } = req.user;
  const batchId = Array.isArray(id) ? id[0] : id;

  // Only ADMIN, or SUPER_ADMIN can update batches
  if (role !== UserRole.ADMIN && role !== UserRole.SUPER_ADMIN) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only admins can update batches');
  }

  const result = await BatchService.updateBatch(batchId, req.body, req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Batch updated successfully',
    data: result,
  });
});

const deleteBatch = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId, role } = req.user;
  const batchId = Array.isArray(id) ? id[0] : id;

  // Only ADMIN, or SUPER_ADMIN can delete batches
  if (role !== UserRole.ADMIN && role !== UserRole.SUPER_ADMIN) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only admins can delete batches');
  }

  const result = await BatchService.deleteBatch(batchId, req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Batch deleted successfully',
    data: result,
  });
});

export const BatchController = {
  createBatch,
  getBatchById,
  getAllBatches,
  updateBatch,
  deleteBatch,
};
