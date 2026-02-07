import { BatchRole } from '../../../prisma/generated/enums';
import { database } from '../../config/database.config';
import {
  createPaginationQuery,
  createPaginationResult,
  PaginationResult,
  parsePaginationOptions,
} from '../../utils/pagination.utils';

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
  return await database.batchEnrollment.findFirst({
    where: { id, isDeleted: false },
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
  query: any
): Promise<PaginationResult<any>> => {
  const pagination = parsePaginationOptions(query);
  const { skip, take, orderBy } = createPaginationQuery(pagination);

  const where: any = { batchId, isDeleted: false };

  if (query.role) {
    where.role = query.role;
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
      take,
      orderBy,
    }),
    database.batchEnrollment.count({ where }),
  ]);
  return createPaginationResult(enrollments, total, pagination);
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
  return await database.batchEnrollment.update({
    where: { id },
    data: { isDeleted: true },
  });
};

// Get user enrollments
const getUserEnrollments = async (userId: string) => {
  return await database.batchEnrollment.findMany({
    where: { userId, isDeleted: false },
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
