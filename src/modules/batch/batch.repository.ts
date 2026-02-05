import { database } from '../../config/database.config';
import { ICreateBatchPayload, IUpdateBatchPayload } from './batch.interface';
import { PaginationOptions, PaginationResult } from '../../utils/pagination.utils';

// Batch CRUD
const createBatch = async (payload: ICreateBatchPayload) => {
  return await database.batch.create({
    data: payload,
    include: {
      institution: true,
      cr: true,
    },
  });
};

const getBatchById = async (id: string) => {
  return await database.batch.findUnique({
    where: { id },
    include: {
      institution: true,
      cr: true,
      enrollments: {
        include: {
          student: true,
        },
      },
    },
  });
};

const getAllBatches = async (
  filters: any,
  options: PaginationOptions
): Promise<PaginationResult<any>> => {
  const { page, limit, sortBy, sortOrder } = options;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (filters.institutionId) {
    where.institutionId = filters.institutionId;
  }

  if (filters.department) {
    where.department = filters.department;
  }

  if (filters.batchType) {
    where.batchType = filters.batchType;
  }

  if (filters.isActive !== undefined) {
    where.isActive = filters.isActive;
  }

  if (filters.isArchived !== undefined) {
    where.isArchived = filters.isArchived;
  }

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { department: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const [batches, total] = await Promise.all([
    database.batch.findMany({
      where,
      include: {
        institution: true,
        cr: true,
        enrollments: {
          include: {
            student: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    }),
    database.batch.count({ where }),
  ]);

  return {
    data: batches,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const updateBatch = async (id: string, payload: IUpdateBatchPayload) => {
  return await database.batch.update({
    where: { id },
    data: payload,
    include: {
      institution: true,
      cr: true,
    },
  });
};

const deleteBatch = async (id: string) => {
  return await database.batch.delete({
    where: { id },
  });
};

export const BatchRepository = {
  // Batch
  createBatch,
  getBatchById,
  getAllBatches,
  updateBatch,
  deleteBatch,
};
