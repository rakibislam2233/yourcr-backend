import { Request, Response } from 'express';
import httpStatus from 'http-status-codes';
import bcrypt from 'bcryptjs';
import { database } from '../../config/database.config';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ICreateStudentPayload, IUserProfileResponse } from './user.interface';
import { UserRole } from '../../shared/enum/user.enum';

// Get all users
const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const users = await database.user.findMany({
    select: {
      id: true,
      fullName: true,
      email: true,
      phoneNumber: true,
      isEmailVerified: true,
      status: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Users fetched successfully',
    data: users,
  });
});

// Get user by ID
const getUserById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = Array.isArray(id) ? id[0] : id;

  const user = await database.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      phoneNumber: true,
      profileImage: true,
      isEmailVerified: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User fetched successfully',
    data: user,
  });
});

// Get user profile with current session
const getUserProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  const user = await database.user.findUnique({
    where: { id: userId },
    include: {
      studentSessions: {
        include: {
          session: true,
        },
        where: {
          isActive: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Get current session
  const currentSession = user.currentSessionId
    ? await database.session.findUnique({
        where: { id: user.currentSessionId },
      })
    : null;

  const userProfile: IUserProfileResponse = {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    status: user.status,
    currentSession: currentSession
      ? {
          id: currentSession.id,
          name: currentSession.name,
          department: currentSession.department,
          academicYear: currentSession.academicYear,
        }
      : undefined,
    allSessions: user.studentSessions.map(ss => ({
      id: ss.session.id,
      name: ss.session.name,
      department: ss.session.department,
      academicYear: ss.session.academicYear,
      isActive: ss.isActive,
    })),
  };

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User profile fetched successfully',
    data: userProfile,
  });
});

// Create student (CR only)
const createStudent = async (crId: string, studentData: ICreateStudentPayload) => {
  // Generate default password
  const defaultPassword = 'Student@123';
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  // Get CR info
  const cr = await database.user.findUnique({
    where: { id: crId },
  });

  if (!cr || !cr.isCr) {
    throw new Error('Only CR can create students');
  }

  // Check if email already exists
  const existingUser = await database.user.findUnique({
    where: { email: studentData.email },
  });
  if (existingUser) {
    throw new Error('Email already exists');
  }

  // Create student with academic info (Version 1: Simple)
  const student = await database.user.create({
    data: {
      fullName: studentData.fullName,
      email: studentData.email,
      phoneNumber: studentData.phoneNumber,
      password: hashedPassword,
      institutionId: studentData.institutionId,
      department: studentData.department,
      program: studentData.program,
      year: studentData.year,
      rollNumber: studentData.rollNumber,
      studentId: studentData.studentId,
      semester: studentData.semester,
      batch: studentData.batch,
      crId: crId,
      role: 'STUDENT',
    },
  });

  // Return student data without password
  const { password, ...studentWithoutPassword } = student;

  return {
    ...studentWithoutPassword,
    defaultPassword,
  };
};

// Update user
const updateUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = Array.isArray(id) ? id[0] : id;
  const updateData = req.body;

  // Check if user exists
  const existingUser = await database.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    throw new Error('User not found');
  }

  // Prevent updating email and password through this endpoint
  const { email, password, ...allowedUpdates } = updateData;

  const user = await database.user.update({
    where: { id: userId },
    data: allowedUpdates,
    select: {
      id: true,
      fullName: true,
      email: true,
      phoneNumber: true,
      profileImage: true,
      isEmailVerified: true,
      status: true,
      updatedAt: true,
    },
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User updated successfully',
    data: user,
  });
});

// Delete user
const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = Array.isArray(id) ? id[0] : id;

  // Check if user exists
  const existingUser = await database.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    throw new Error('User not found');
  }

  await database.user.delete({
    where: { id: userId },
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User deleted successfully',
  });
});

export const UserController = {
  getAllUsers,
  getUserById,
  getUserProfile,
  createStudent,
  updateUser,
  deleteUser,
};
