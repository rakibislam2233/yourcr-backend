import { database } from '../../config/database.config';
import { PaginationOptions, PaginationResult } from '../../utils/pagination.utils';
import { IBatchFilters, ICreateBatchPayload, IUpdateBatchPayload } from './batch.interface';

// Batch CRUD
const createBatch = async (payload: ICreateBatchPayload) => {
  return await database.batch.create({
    data: payload as any,
    include: {
      institution: true,
      creator: true,
    },
  });
};

const getBatchById = async (id: string) => {
  return await database.batch.findFirst({
    where: { id, isDeleted: false },
    include: {
      institution: true,
      creator: true,
      enrollments: {
        include: {
          user: true,
        },
      },
    },
  });
};

const getAllBatches = async (
  filters: IBatchFilters,
  options: PaginationOptions
): Promise<PaginationResult<any>> => {
  const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;
  const skip = (page - 1) * limit;

  const where: any = { isDeleted: false };

  if (filters.institutionId) {
    where.institutionId = filters.institutionId;
  }

  if (filters.department) {
    where.department = filters.department;
  }

  if (filters.session) {
    where.session = filters.session;
  }

  if (filters.semester) {
    where.semester = filters.semester;
  }

  if (filters.shift) {
    where.shift = filters.shift;
  }

  if (filters.group) {
    where.group = filters.group;
  }

  if (filters.isActive !== undefined) {
    where.isActive = filters.isActive;
  }

  if (filters.isArchived !== undefined) {
    where.isArchived = filters.isArchived;
  }

  if (filters.search) {
    where.OR = [
      { department: { contains: filters.search, mode: 'insensitive' } },
      { session: { contains: filters.search, mode: 'insensitive' } },
      { semester: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const [batches, total] = await Promise.all([
    database.batch.findMany({
      where,
      include: {
        institution: true,
        creator: true,
        enrollments: {
          include: {
            user: true,
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
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
};

const updateBatch = async (id: string, payload: IUpdateBatchPayload) => {
  return await database.batch.update({
    where: { id },
    data: payload as any,
    include: {
      institution: true,
      creator: true,
    },
  });
};

const deleteBatch = async (id: string) => {
  return await database.batch.update({
    where: { id },
    data: { isDeleted: true },
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
