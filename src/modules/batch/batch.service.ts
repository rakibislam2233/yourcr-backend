import { StatusCodes } from 'http-status-codes';
import ApiError from '../../utils/ApiError';
import { ICreateBatchPayload, IUpdateBatchPayload } from './batch.interface';
import { BatchRepository } from './batch.repository';
import { UserRepository } from '../user/user.repository';
import { createAuditLog } from '../../utils/audit.helper';
import { AuditAction } from '../../shared/enum/audit.enum';
import { Request } from 'express';

// ── Batch Service ───────────────────────────────────────────────────
const createBatch = async (payload: ICreateBatchPayload, req?: Request) => {
  // Check if batch with same details already exists for this institution
  const existingBatch = await BatchRepository.getAllBatches(
    {
      institutionId: payload.institutionId,
      name: payload.name,
      department: payload.department,
      batchType: payload.batchType,
      academicYear: payload.academicYear,
    },
    { page: 1, limit: 1, sortBy: 'createdAt', sortOrder: 'desc' }
  );

  if (existingBatch.data.length > 0) {
    throw new ApiError(
      StatusCodes.CONFLICT,
      'Batch with these details already exists for this institution'
    );
  }

  const batch = await BatchRepository.createBatch(payload);

  // Audit log
  await createAuditLog(
    req?.user?.id,
    AuditAction.CREATE_CLASS,
    'Batch',
    batch.id,
    { payload },
    req
  );

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

  return await BatchRepository.updateBatch(id, payload);
};

const deleteBatch = async (id: string, req?: Request) => {
  const existing = await BatchRepository.getBatchById(id);
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Batch not found');
  }

  return await BatchRepository.deleteBatch(id);
};

// ── Helper Methods ───────────────────────────────────────────────────
const checkExistingBatch = async (filters: any) => {
  const result = await BatchRepository.getAllBatches(
    {
      institutionId: filters.institutionId,
      name: filters.name,
      department: filters.department,
      academicYear: filters.academicYear,
    },
    { page: 1, limit: 1, sortBy: 'createdAt', sortOrder: 'desc' }
  );

  return result.data.length > 0;
};

const getBatchesByInstitution = async (institutionId: string) => {
  return await BatchRepository.getAllBatches(
    { institutionId },
    { page: 1, limit: 100, sortBy: 'createdAt', sortOrder: 'desc' }
  );
};

const getUserBatches = async (userId: string) => {
  const user = await UserRepository.getUserById(userId);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  // If user has a current batch, return that batch
  if (user.currentBatchId) {
    const batch = await BatchRepository.getBatchById(user.currentBatchId);
    return batch ? [batch] : [];
  }
  return [];
};

const getBatchCRs = async (batchId: string) => {
  const batch = await BatchRepository.getBatchById(batchId);
  if (!batch) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Batch not found');
  }

  // Return the CR associated with this batch
  if (batch.crId) {
    const cr = await UserRepository.getUserById(batch.crId);
    return cr ? [cr] : [];
  }

  return [];
};

export const BatchService = {
  // Batch
  createBatch,
  getBatchById,
  getAllBatches,
  updateBatch,
  deleteBatch,
  // Helper methods
  checkExistingBatch,
  getBatchesByInstitution,
  getUserBatches,
  getBatchCRs,
};
