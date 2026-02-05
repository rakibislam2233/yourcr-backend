import { StatusCodes } from 'http-status-codes';
import ApiError from '../../utils/ApiError';
import {
  ICreateBatchEnrollmentPayload,
  IUpdateBatchEnrollmentPayload,
  IBatchEnrollmentResponse,
  IBatchMemberResponse,
} from './batchEnrollment.interface';
import { database } from '../../config/database.config';
import { PaginationOptions, PaginationResult } from '../../utils/pagination.utils';

// Create batch enrollment
const createBatchEnrollment = async (data: ICreateBatchEnrollmentPayload, enrolledById: string) => {
  return await database.batchEnrollment.create({
    data: {
      batchId: data.batchId,
      userId: data.userId,
      role: data.role || 'STUDENT',
      studentId: data.studentId,
      enrolledBy: enrolledById,
    },
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
  });
};

// Get batch enrollment by ID
const getBatchEnrollmentById = async (id: string) => {
  return await database.batchEnrollment.findUnique({
    where: { id },
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

// Get batch members (with roles)
const getBatchMembers = async (batchId: string, options?: any): Promise<IBatchMemberResponse[]> => {
  const enrollments = await database.batchEnrollment.findMany({
    where: { 
      batchId,
      ...(options?.role && { role: options.role })
    },
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
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  return enrollments.map((enrollment: any) => ({
    id: enrollment.id,
    user: {
      id: enrollment.user.id,
      fullName: enrollment.user.fullName,
      email: enrollment.user.email,
      phoneNumber: enrollment.user.phoneNumber,
      profileImage: enrollment.user.profileImage,
    },
    role: enrollment.role,
    studentId: enrollment.studentId,
    enrolledAt: enrollment.enrolledAt,
    isActive: enrollment.isActive,
  }));
};

// Update batch enrollment
const updateBatchEnrollment = async (id: string, data: IUpdateBatchEnrollmentPayload) => {
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

// Get batch by ID (helper)
const getBatchById = async (id: string) => {
  return await database.batch.findUnique({
    where: { id },
  });
};

export const BatchEnrollmentService = {
  createBatchEnrollment,
  getBatchEnrollmentById,
  getAllBatchEnrollments,
  getBatchMembers,
  updateBatchEnrollment,
  deleteBatchEnrollment,
  getUserEnrollments,
  getBatchById,
};
