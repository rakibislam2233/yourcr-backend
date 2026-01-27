import { Request, Response } from 'express';
import httpStatus from 'http-status-codes';
import { database } from '../../config/database.config';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';

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
  updateUser,
  deleteUser,
};
