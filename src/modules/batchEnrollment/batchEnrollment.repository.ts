import { BatchRole } from '../../../prisma/generated/enums';
import { database } from '../../config/database.config';
import { PaginationOptions, PaginationResult } from '../../utils/pagination.utils';

// Create batch enrollment
const createBatchEnrollment = async (data: {
  batchId: string;
  userId: string;
  role: BatchRole;
  studentId?: string;
  enrolledBy?: string;
}) => {
  return await database.batchEnrollment.create({
    data: {
      batchId: data.batchId,
      userId: data.userId,
      role: data.role,
      studentId: data.studentId,
      enrolledBy: data.enrolledBy,
    },
    include: {
      user: true,
      batch: true,
      enrollmentAddedBy: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  });
};

// Get batch enrollment by ID
const getBatchEnrollmentById = async (id: string) => {
  return await database.batchEnrollment.findUnique({
    where: { id },
    include: {
      user: true,
      batch: true,
      enrollmentAddedBy: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  });
};

// Get all batch enrollments
const getAllBatchEnrollments = async (
  batchId: string,
  options: PaginationOptions
): Promise<PaginationResult<any>> => {
  const { page, limit, sortBy, sortOrder } = options;
  const skip = (page - 1) * limit;

  const where: any = { batchId };

  if (options.role) {
    where.role = options.role;
  }

  const [enrollments, total] = await Promise.all([
    database.batchEnrollment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            profileImage: true,
          },
        },
        batch: true,
        enrollmentAddedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
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
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Update batch enrollment
const updateBatchEnrollment = async (id: string, data: any) => {
  return await database.batchEnrollment.update({
    where: { id },
    data,
    include: {
      user: true,
      batch: true,
    },
  });
};

// Delete batch enrollment
const deleteBatchEnrollment = async (id: string) => {
  return await database.batchEnrollment.delete({
    where: { id },
  });
};

// Get user enrollments
const getUserEnrollments = async (userId: string) => {
  return await database.batchEnrollment.findMany({
    where: { userId },
    include: {
      batch: true,
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const BatchEnrollmentRepository = {
  createBatchEnrollment,
  getBatchEnrollmentById,
  getAllBatchEnrollments,
  updateBatchEnrollment,
  deleteBatchEnrollment,
  getUserEnrollments,
};
