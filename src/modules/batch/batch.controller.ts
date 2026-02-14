import { Request, Response } from 'express';
import httpStatus from 'http-status-codes';
import { UserRole } from '../../../prisma/generated/enums';
import ApiError from '../../utils/ApiError';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { BatchEnrollmentService } from '../batchEnrollment/batchEnrollment.service';
import { IBatchFilters } from './batch.interface';
import { BatchService } from './batch.service';

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

  const result = await BatchService.getBatchById(batchId as string);

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
    session: req.query.session,
    batchType: req.query.batchType,
    semester: req.query.semester,
    shift: req.query.shift,
    group: req.query.group,
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

  const result = await BatchService.getAllBatches(filters as IBatchFilters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Batches fetched successfully',
    meta: result.pagination,
    data: result.data,
  });
});

const updateBatch = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.user;
  const batchId = Array.isArray(id) ? id[0] : id;

  // Only ADMIN, or SUPER_ADMIN can update batches
  if (role !== UserRole.ADMIN && role !== UserRole.SUPER_ADMIN) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only admins can update batches');
  }

  const result = await BatchService.updateBatch(batchId as string, req.body, req);

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

  // Only ADMIN, or SUPER_ADMIN can delete batches
  if (role !== UserRole.ADMIN && role !== UserRole.SUPER_ADMIN) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Only admins can delete batches');
  }

  const result = await BatchService.deleteBatch(batchId as string, req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Batch deleted successfully',
    data: result,
  });
});

// ── Batch Enrollment Controllers ─────────────────────────────────────────
const checkExistingBatch = catchAsync(async (req: Request, res: Response) => {
  const filters = {
    institutionId: req.query.institutionId,
    department: req.query.department,
    session: req.query.session,
    batchType: req.query.batchType,
    academicYear: req.query.academicYear,
    semester: req.query.semester,
    shift: req.query.shift,
    group: req.query.group,
  };

  const result = await BatchService.checkExistingBatch(filters as IBatchFilters);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Batch existence checked successfully',
    data: result,
  });
});

const createBatchEnrollment = catchAsync(async (req: Request, res: Response) => {
  const { batchId } = req.params;
  const { userId, role } = req.user;

  // Only CR, ADMIN, or SUPER_ADMIN can enroll users in a batch
  if (role !== UserRole.CR && role !== UserRole.ADMIN && role !== UserRole.SUPER_ADMIN) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'Only CR, Admin or Super Admin can enroll users in a batch'
    );
  }

  const result = await BatchEnrollmentService.createBatchEnrollment({
    batchId: batchId as string,
    userId: req.body.userId,
    enrolledBy: userId as string,
    role: req.body.role,
    studentId: req.body.studentId,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'User enrolled in batch successfully',
    data: result,
  });
});

const getAllBatchEnrollments = catchAsync(async (req: Request, res: Response) => {
  const { batchId } = req.params;
  const filters = req.query;
  const options = {
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 10,
    sortBy: (req.query.sortBy as string) || 'createdAt',
    sortOrder: (req.query.sortOrder as string) || 'desc',
  };

  const result = await BatchEnrollmentService.getAllBatchEnrollments(
    batchId as string,
    filters,
    options
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Batch enrollments fetched successfully',
    data: result,
  });
});

const getBatchMembers = catchAsync(async (req: Request, res: Response) => {
  const { batchId } = req.params;

  const result = await BatchEnrollmentService.getBatchMembers({ batchId: batchId as string });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Batch members fetched successfully',
    data: result,
  });
});

const getBatchEnrollmentById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const enrollmentId = Array.isArray(id) ? id[0] : id;

  const result = await BatchEnrollmentService.getBatchEnrollmentById(enrollmentId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Batch enrollment fetched successfully',
    data: result,
  });
});

const updateBatchEnrollment = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.user;
  const enrollmentId = Array.isArray(id) ? id[0] : id;

  // Only CR, ADMIN, or SUPER_ADMIN can update batch enrollment
  if (role !== UserRole.CR && role !== UserRole.ADMIN && role !== UserRole.SUPER_ADMIN) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'Only CR, Admin or Super Admin can update batch enrollment'
    );
  }

  const result = await BatchEnrollmentService.updateBatchEnrollment(
    enrollmentId as string,
    req.body
  );

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

  // Only CR, ADMIN, or SUPER_ADMIN can delete batch enrollment
  if (role !== UserRole.CR && role !== UserRole.ADMIN && role !== UserRole.SUPER_ADMIN) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'Only CR, Admin or Super Admin can delete batch enrollment'
    );
  }

  const result = await BatchEnrollmentService.deleteBatchEnrollment(enrollmentId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Batch enrollment deleted successfully',
    data: result,
  });
});

// ── Helper Controllers ───────────────────────────────────────────────────
const getBatchesByInstitution = catchAsync(async (req: Request, res: Response) => {
  const { institutionId } = req.params;

  const result = await BatchService.getBatchesByInstitution(institutionId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Batches fetched successfully',
    data: result,
  });
});

const getUserBatches = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;

  const result = await BatchService.getUserBatches(userId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User batches fetched successfully',
    data: result,
  });
});

const getBatchCRs = catchAsync(async (req: Request, res: Response) => {
  const { batchId } = req.params;

  const result = await BatchService.getBatchCRs(batchId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Batch CRs fetched successfully',
    data: result,
  });
});

export const BatchController = {
  createBatch,
  getBatchById,
  getAllBatches,
  updateBatch,
  deleteBatch,
  checkExistingBatch,
  createBatchEnrollment,
  getAllBatchEnrollments,
  getBatchMembers,
  getBatchEnrollmentById,
  updateBatchEnrollment,
  deleteBatchEnrollment,
  getBatchesByInstitution,
  getUserBatches,
  getBatchCRs,
};
