import { StatusCodes } from 'http-status-codes';
import ApiError from '../../utils/ApiError';
import {
  ICreateBatchPayload,
  IUpdateBatchPayload,
  IBatchEnrollmentPayload,
  IUpdateBatchEnrollmentPayload,
} from './batch.interface';
import { BatchRepository } from './batch.repository';
import { UserRepository } from '../user/user.repository';
import { UserRole } from '../../shared/enum/user.enum';
import { createAuditLog } from '../../utils/audit.helper';
import { AuditAction } from '../../shared/enum/audit.enum';
import { Request } from 'express';

// Batch Service
const createBatch = async (payload: ICreateBatchPayload, req?: Request) => {
  // Validate CR exists and is CR
  const cr = await UserRepository.getUserById(payload.crId);
  if (!cr || !cr.isCr) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Only CR can create batches');
  }

  // Check if batch with same name already exists for this institution
  const existingBatch = await BatchRepository.getAllBatches(
    { institutionId: payload.institutionId, name: payload.name },
    { page: 1, limit: 1, sortBy: 'createdAt', sortOrder: 'desc' }
  );
  
  if (existingBatch.data.length > 0) {
    throw new ApiError(StatusCodes.CONFLICT, 'Batch with this name already exists for this institution');
  }

  const batch = await BatchRepository.createBatch(payload);

  // Update CR's current batch
  await UserRepository.updateUserById(payload.crId, {
    currentBatchId: batch.id,
  });

  // Audit log
  await createAuditLog(payload.crId, AuditAction.CREATE_CLASS, 'Batch', batch.id, { payload }, req);

  return batch;
};

const getBatchById = async (id: string) => {
  const batch = await BatchRepository.getBatchById(id);
  if (!batch) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Batch not found');
  }
  return batch;
};

const getAllBatches = async (filters: any, options: any) => {
  return await BatchRepository.getAllBatches(filters, options);
};

const updateBatch = async (id: string, payload: IUpdateBatchPayload, req?: Request) => {
  const existing = await BatchRepository.getBatchById(id);
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Batch not found');
  }

  // If CR is being changed, validate new CR
  if (payload.crId && payload.crId !== existing.crId) {
    const newCr = await UserRepository.getUserById(payload.crId);
    if (!newCr || !newCr.isCr) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Only CR can be assigned as batch CR');
    }

    // Update old CR's current batch if needed
    await UserRepository.updateUserById(existing.crId, {
      currentBatchId: null,
    });

    // Update new CR's current batch
    await UserRepository.updateUserById(payload.crId, {
      currentBatchId: id,
    });
  }

  return await BatchRepository.updateBatch(id, payload);
};

const deleteBatch = async (id: string, req?: Request) => {
  const existing = await BatchRepository.getBatchById(id);
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Batch not found');
  }

  // Remove current batch reference from CR
  await UserRepository.updateUserById(existing.crId, {
    currentBatchId: null,
  });

  return await BatchRepository.deleteBatch(id);
};

// Batch Enrollment Service
const createBatchEnrollment = async (
  payload: IBatchEnrollmentPayload,
  addedById: string,
  req?: Request
) => {
  // Validate batch exists
  const batch = await BatchRepository.getBatchById(payload.batchId);
  if (!batch) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Batch not found');
  }

  // Validate student exists
  const student = await UserRepository.getUserById(payload.studentId);
  if (!student || student.role !== UserRole.STUDENT) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Student not found');
  }

  // Check if student is already enrolled in this batch
  const existingEnrollment = await BatchRepository.getAllBatchEnrollments(
    payload.batchId,
    { page: 1, limit: 1, sortBy: 'createdAt', sortOrder: 'desc' }
  );
  
  const alreadyEnrolled = existingEnrollment.data.find(
    enrollment => enrollment.studentId === payload.studentId
  );
  
  if (alreadyEnrolled) {
    throw new ApiError(StatusCodes.CONFLICT, 'Student is already enrolled in this batch');
  }

  // Update student's current batch
  await UserRepository.updateUserById(payload.studentId, {
    currentBatchId: payload.batchId,
  });

  const enrollment = await BatchRepository.createBatchEnrollment({
    ...payload,
    addedById,
  });

  // Audit log
  await createAuditLog(addedById, AuditAction.CREATE_ISSUE, 'BatchEnrollment', enrollment.id, { payload }, req);

  return enrollment;
};

const getBatchEnrollmentById = async (id: string) => {
  const enrollment = await BatchRepository.getBatchEnrollmentById(id);
  if (!enrollment) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Batch enrollment not found');
  }
  return enrollment;
};

const getAllBatchEnrollments = async (batchId: string, options: any) => {
  // Validate batch exists
  const batch = await BatchRepository.getBatchById(batchId);
  if (!batch) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Batch not found');
  }

  return await BatchRepository.getAllBatchEnrollments(batchId, options);
};

const updateBatchEnrollment = async (id: string, payload: IUpdateBatchEnrollmentPayload, req?: Request) => {
  const existing = await BatchRepository.getBatchEnrollmentById(id);
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Batch enrollment not found');
  }

  // If status is being changed to REMOVED, update student's current batch
  if (payload.status === 'REMOVED' && existing.status !== 'REMOVED') {
    await UserRepository.updateUserById(existing.studentId, {
      currentBatchId: null,
    });
  }

  return await BatchRepository.updateBatchEnrollment(id, payload);
};

const deleteBatchEnrollment = async (id: string) => {
  const existing = await BatchRepository.getBatchEnrollmentById(id);
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Batch enrollment not found');
  }

  // Remove current batch reference from student
  await UserRepository.updateUserById(existing.studentId, {
    currentBatchId: null,
  });

  return await BatchRepository.deleteBatchEnrollment(id);
};

// Helper functions
const getBatchesByCrId = async (crId: string) => {
  return await BatchRepository.getBatchesByCrId(crId);
};

const getStudentBatches = async (studentId: string) => {
  return await BatchRepository.getStudentBatches(studentId);
};

export const BatchService = {
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
