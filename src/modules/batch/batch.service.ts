import { Request } from 'express';
import { StatusCodes } from 'http-status-codes';
import { database } from '../../config/database.config';
import { AuditAction } from '../../shared/enum/audit.enum';
import ApiError from '../../utils/ApiError';
import { createAuditLog } from '../../utils/audit.helper';
import { UserRepository } from '../user/user.repository';
import { IBatchFilters, ICreateBatchPayload, IUpdateBatchPayload } from './batch.interface';
import { BatchRepository } from './batch.repository';

// ── Batch Service ───────────────────────────────────────────────────
const createBatch = async (payload: ICreateBatchPayload, req?: Request) => {
  // Check if batch with same details already exists for this institution
  const existingBatch = await BatchRepository.getAllBatches(payload, {
    page: 1,
    limit: 1,
  });

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

const getAllBatches = async (filters: IBatchFilters, query: any) => {
  return await BatchRepository.getAllBatches(filters, query);
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
const checkExistingBatch = async (filters: IBatchFilters) => {
  const result = await BatchRepository.getAllBatches(filters, {
    page: 1,
    limit: 1,
  });

  return result.data.length > 0;
};

const getBatchesByInstitution = async (institutionId: string) => {
  return await BatchRepository.getAllBatches({ institutionId }, { page: 1, limit: 100 });
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

  // Return CRs from batch enrollments
  const enrollments = await database.batchEnrollment.findMany({
    where: {
      batchId,
      role: 'CR',
      isActive: true,
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true,
        },
      },
    },
  });

  return enrollments.map((enrollment: any) => enrollment.user);
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
