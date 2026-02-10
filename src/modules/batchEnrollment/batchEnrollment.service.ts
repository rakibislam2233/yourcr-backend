import { database } from '../../config/database.config';
import {
  IBatchMemberResponse,
  ICreateBatchEnrollmentPayload,
  IUpdateBatchEnrollmentPayload,
} from './batchEnrollment.interface';
import { BatchEnrollmentRepository } from './batchEnrollment.repository';

// Create batch enrollment
const createBatchEnrollment = async (data: ICreateBatchEnrollmentPayload) => {
  return await database.batchEnrollment.create({
    data: {
      batchId: data.batchId,
      userId: data.userId,
      role: data.role || 'STUDENT',
      studentId: data.studentId,
      enrolledBy: data.enrolledBy,
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
const getAllBatchEnrollments = async (batchId: string, filters: any, options: any) => {
  const result = await BatchEnrollmentRepository.getAllBatchEnrollments(batchId, {
    ...filters,
    ...options,
  });
  return result;
};

// Get batch members (with roles)
const getBatchMembers = async (params: { batchId: string }): Promise<IBatchMemberResponse[]> => {
  const { batchId } = params;

  const enrollments = await database.batchEnrollment.findMany({
    where: { batchId },
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
      enrolledAt: 'desc',
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
