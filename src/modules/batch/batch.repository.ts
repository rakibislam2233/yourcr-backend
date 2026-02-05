import { database } from '../../config/database.config';
import {
  ICreateBatchPayload,
  IUpdateBatchPayload,
  IBatchEnrollmentPayload,
  IUpdateBatchEnrollmentPayload,
} from './batch.interface';
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

const getAllBatches = async (filters: any, options: PaginationOptions): Promise<PaginationResult<any>> => {
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

// Batch Enrollment CRUD
const createBatchEnrollment = async (payload: IBatchEnrollmentPayload & { addedById: string }) => {
  return await database.batchEnrollment.create({
    data: payload,
    include: {
      batch: true,
      student: true,
      addedBy: true,
    },
  });
};

const getBatchEnrollmentById = async (id: string) => {
  return await database.batchEnrollment.findUnique({
    where: { id },
    include: {
      batch: true,
      student: true,
      addedBy: true,
    },
  });
};

const getAllBatchEnrollments = async (batchId: string, options: PaginationOptions): Promise<PaginationResult<any>> => {
  const { page, limit, sortBy, sortOrder } = options;
  const skip = (page - 1) * limit;

  const where: any = { batchId };
  
  if (options.filters?.status) {
    where.status = options.filters.status;
  }

  const [enrollments, total] = await Promise.all([
    database.batchEnrollment.findMany({
      where,
      include: {
        batch: true,
        student: true,
        addedBy: true,
      },
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    }),
    database.batchEnrollment.count({ where }),
  ]);

  return {
    data: enrollments,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const updateBatchEnrollment = async (id: string, payload: IUpdateBatchEnrollmentPayload) => {
  return await database.batchEnrollment.update({
    where: { id },
    data: payload,
    include: {
      batch: true,
      student: true,
      addedBy: true,
    },
  });
};

const deleteBatchEnrollment = async (id: string) => {
  return await database.batchEnrollment.delete({
    where: { id },
  });
};

// Helper functions
const getBatchesByCrId = async (crId: string) => {
  return await database.batch.findMany({
    where: { crId },
    include: {
      institution: true,
      enrollments: {
        include: {
          student: true,
        },
      },
    },
  });
};

const getStudentBatches = async (studentId: string) => {
  return await database.batchEnrollment.findMany({
    where: { studentId },
    include: {
      batch: {
        include: {
          institution: true,
          cr: true,
        },
      },
    },
  });
};

export const BatchRepository = {
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
