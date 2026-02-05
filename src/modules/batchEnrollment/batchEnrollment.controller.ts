import { Request, Response } from 'express';
import httpStatus from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { BatchEnrollmentService } from './batchEnrollment.service';
import ApiError from '../../utils/ApiError';
import { UserRole } from '../../shared/enum/user.enum';
import { BatchEnrollmentValidations } from './batchEnrollment.validation';
import validateRequest from '../../middleware/validation.middleware';

const createBatchEnrollment = catchAsync(async (req: Request, res: Response) => {
  const { userId, role } = req.user;
  
  // Only CR, ADMIN, or SUPER_ADMIN can enroll users in batches
  if (role !== UserRole.CR && role !== UserRole.ADMIN && role !== UserRole.SUPER_ADMIN) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Access denied');
  }

  const result = await BatchEnrollmentService.createBatchEnrollment(req.body, userId, req);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'User enrolled in batch successfully',
    data: result,
  });
});

const getBatchEnrollmentById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const enrollmentId = Array.isArray(id) ? id[0] : id;
  
  const result = await BatchEnrollmentService.getBatchEnrollmentById(enrollmentId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Batch enrollment fetched successfully',
    data: result,
  });
});

const getAllBatchEnrollments = catchAsync(async (req: Request, res: Response) => {
  const { batchId } = req.params;
  const { userId, role } = req.user;

  // Validate batch access
  const batch = await BatchEnrollmentService.getBatchById(batchId as string);
  
  // Check if user is enrolled in this batch or is admin
  const userBatches = await BatchEnrollmentService.getUserEnrollments(userId);
  const isEnrolled = userBatches.some((b: any) => b.batchId === batchId);
  
  if (!isEnrolled && role !== UserRole.ADMIN && role !== UserRole.SUPER_ADMIN) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Access denied to this batch');
  }

  const options = {
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 10,
    sortBy: req.query.sortBy as string || 'createdAt',
    sortOrder: req.query.sortOrder as string || 'desc',
  };

  const result = await BatchEnrollmentService.getAllBatchEnrollments(batchId as string, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Batch enrollments fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getBatchMembers = catchAsync(async (req: Request, res: Response) => {
  const { batchId } = req.params;
  const { userId, role } = req.user;

  // Validate batch access
  const batch = await BatchEnrollmentService.getBatchById(batchId as string);
  
  // Check if user is enrolled in this batch or is admin
  const userBatches = await BatchEnrollmentService.getUserEnrollments(userId);
  const isEnrolled = userBatches.some((b: any) => b.batchId === batchId);
  
  if (!isEnrolled && role !== UserRole.ADMIN && role !== UserRole.SUPER_ADMIN) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Access denied to this batch');
  }

  const options = {
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 50,
    role: req.query.role as string, // Filter by role if provided
  };

  const result = await BatchEnrollmentService.getBatchMembers(batchId as string, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Batch members fetched successfully',
    data: result,
  });
});

const updateBatchEnrollment = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId, role } = req.user;
  const enrollmentId = Array.isArray(id) ? id[0] : id;

  // Only CR, ADMIN, or SUPER_ADMIN can update enrollments
  if (role !== UserRole.CR && role !== UserRole.ADMIN && role !== UserRole.SUPER_ADMIN) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Access denied');
  }

  const result = await BatchEnrollmentService.updateBatchEnrollment(enrollmentId, req.body, req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Batch enrollment updated successfully',
    data: result,
  });
});

const deleteBatchEnrollment = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId, role } = req.user;
  const enrollmentId = Array.isArray(id) ? id[0] : id;

  // Only CR, ADMIN, or SUPER_ADMIN can delete enrollments
  if (role !== UserRole.CR && role !== UserRole.ADMIN && role !== UserRole.SUPER_ADMIN) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Access denied');
  }

  const result = await BatchEnrollmentService.deleteBatchEnrollment(enrollmentId, req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Batch enrollment deleted successfully',
    data: result,
  });
});

// Helper Controllers
const getUserEnrollments = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { userId: currentUserId, role } = req.user;

  // Users can only see their own enrollments unless they're admin
  if (userId !== currentUserId && role !== UserRole.ADMIN && role !== UserRole.SUPER_ADMIN) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Access denied');
  }

  const result = await BatchEnrollmentService.getUserEnrollments(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User enrollments fetched successfully',
    data: result,
  });
});

export const BatchEnrollmentController = {
  createBatchEnrollment,
  getBatchEnrollmentById,
  getAllBatchEnrollments,
  getBatchMembers,
  updateBatchEnrollment,
  deleteBatchEnrollment,
  getUserEnrollments,
};
