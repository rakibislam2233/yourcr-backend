import { Request, Response } from 'express';
import httpStatus from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { BatchService } from './batch.service';
import ApiError from '../../utils/ApiError';
import { UserRole } from '../../shared/enum/user.enum';

// Batch Controllers
const createBatch = catchAsync(async (req: Request, res: Response) => {
  const { userId, role } = req.user;
  
  // Only CR, ADMIN, or SUPER_ADMIN can create batches
  if (role !== UserRole.CR && role !== UserRole.ADMIN && role !== UserRole.SUPER_ADMIN) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Access denied');
  }

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
    sortBy: req.query.sortBy as string || 'createdAt',
    sortOrder: req.query.sortOrder as string || 'desc',
  };

  const result = await BatchService.getAllBatches(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Batches fetched successfully',
    data: result.data,
    meta: result.pagination,
  });
});

const updateBatch = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId, role } = req.user;
  const batchId = Array.isArray(id) ? id[0] : id;
  
  // Only CR, ADMIN, or SUPER_ADMIN can update batches
  if (role !== UserRole.CR && role !== UserRole.ADMIN && role !== UserRole.SUPER_ADMIN) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Access denied');
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
  const { role } = req.user;
  const batchId = Array.isArray(id) ? id[0] : id;
  
  // Only ADMIN or SUPER_ADMIN can delete batches
  if (role !== UserRole.ADMIN && role !== UserRole.SUPER_ADMIN) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Access denied');
  }

  const result = await BatchService.deleteBatch(batchId, req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Batch deleted successfully',
    data: result,
  });
});

// Batch Enrollment Controllers
const createBatchEnrollment = catchAsync(async (req: Request, res: Response) => {
  const { userId, role } = req.user;
  
  // Only CR, ADMIN, or SUPER_ADMIN can enroll students
  if (role !== UserRole.CR && role !== UserRole.ADMIN && role !== UserRole.SUPER_ADMIN) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Access denied');
  }

  const result = await BatchService.createBatchEnrollment(req.body, userId, req);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Student enrolled successfully',
    data: result,
  });
});

const getBatchEnrollmentById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const enrollmentId = Array.isArray(id) ? id[0] : id;
  
  const result = await BatchService.getBatchEnrollmentById(enrollmentId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Batch enrollment fetched successfully',
    data: result,
  });
});

const getAllBatchEnrollments = catchAsync(async (req: Request, res: Response) => {
  const { batchId } = req.params;
  const batchIdStr = Array.isArray(batchId) ? batchId[0] : batchId;
  
  const options = {
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 10,
    sortBy: req.query.sortBy as string || 'createdAt',
    sortOrder: req.query.sortOrder as string || 'desc',
    filters: {
      status: req.query.status,
    },
  };

  const result = await BatchService.getAllBatchEnrollments(batchIdStr, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Batch enrollments fetched successfully',
    data: result.data,
    meta: result.pagination,
  });
});

const updateBatchEnrollment = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.user;
  const enrollmentId = Array.isArray(id) ? id[0] : id;
  
  // Only CR, ADMIN, or SUPER_ADMIN can update enrollments
  if (role !== UserRole.CR && role !== UserRole.ADMIN && role !== UserRole.SUPER_ADMIN) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Access denied');
  }

  const result = await BatchService.updateBatchEnrollment(enrollmentId, req.body, req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Batch enrollment updated successfully',
    data: result,
  });
});

const deleteBatchEnrollment = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.user;
  const enrollmentId = Array.isArray(id) ? id[0] : id;
  
  // Only ADMIN or SUPER_ADMIN can delete enrollments
  if (role !== UserRole.ADMIN && role !== UserRole.SUPER_ADMIN) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Access denied');
  }

  const result = await BatchService.deleteBatchEnrollment(enrollmentId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Batch enrollment deleted successfully',
    data: result,
  });
});

// Helper Controllers
const getBatchesByCrId = catchAsync(async (req: Request, res: Response) => {
  const { crId } = req.params;
  const crIdStr = Array.isArray(crId) ? crId[0] : crId;
  
  const result = await BatchService.getBatchesByCrId(crIdStr);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'CR batches fetched successfully',
    data: result,
  });
});

const getStudentBatches = catchAsync(async (req: Request, res: Response) => {
  const { studentId } = req.params;
  const studentIdStr = Array.isArray(studentId) ? studentId[0] : studentId;
  
  const result = await BatchService.getStudentBatches(studentIdStr);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Student batches fetched successfully',
    data: result,
  });
});

export const BatchController = {
  // Batch
  createBatch,
  getBatchById,
  getAllBatches,
  updateBatch,
  deleteBatch,
  
  // Batch Enrollment
  createBatchEnrollment,
  getBatchEnrollmentById,
  getAllBatchEnrollments,
  updateBatchEnrollment,
  deleteBatchEnrollment,
  
  // Helpers
  getBatchesByCrId,
  getStudentBatches,
};
