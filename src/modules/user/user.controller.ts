import { Request, Response } from 'express';
import httpStatus from 'http-status-codes';
import { prisma } from '../../config/database.config';
import ApiResponse from '../../utils/ApiResponse';
import catchAsync from '../../utils/catchAsync';

// Get all users
const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      isVerified: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  res
    .status(httpStatus.OK)
    .json(new ApiResponse(httpStatus.OK, 'Users fetched successfully', users));
});

// Get user by ID
const getUserById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = Array.isArray(id) ? id[0] : id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatar: true,
      isVerified: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, 'User fetched successfully', user));
});

// Update user
const updateUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = Array.isArray(id) ? id[0] : id;
  const updateData = req.body;

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    throw new Error('User not found');
  }

  // Prevent updating email and password through this endpoint
  const { email, password, ...allowedUpdates } = updateData;

  const user = await prisma.user.update({
    where: { id: userId },
    data: allowedUpdates,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatar: true,
      isVerified: true,
      isActive: true,
      updatedAt: true,
    },
  });

  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, 'User updated successfully', user));
});

// Delete user
const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = Array.isArray(id) ? id[0] : id;

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    throw new Error('User not found');
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, 'User deleted successfully'));
});

export const UserController = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
