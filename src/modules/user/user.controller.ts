import { Request, Response } from 'express';
import prisma from '../../database/connection';
import catchAsync from '../../utils/catchAsync';
import httpStatus from 'http-status-codes';
import ApiResponse from '../../utils/ApiResponse';

export class UserController {
  // Get all users
  static getAllUsers = catchAsync(async (req: Request, res: Response) => {
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

    res.status(httpStatus.OK).json(
      new ApiResponse(
        httpStatus.OK,
        'Users fetched successfully',
        users
      )
    );
  });

  // Get user by ID
  static getUserById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id },
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

    res.status(httpStatus.OK).json(
      new ApiResponse(
        httpStatus.OK,
        'User fetched successfully',
        user
      )
    );
  });

  // Update user
  static updateUser = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new Error('User not found');
    }

    // Prevent updating email and password through this endpoint
    const { email, password, ...allowedUpdates } = updateData;

    const user = await prisma.user.update({
      where: { id },
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

    res.status(httpStatus.OK).json(
      new ApiResponse(
        httpStatus.OK,
        'User updated successfully',
        user
      )
    );
  });

  // Delete user
  static deleteUser = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new Error('User not found');
    }

    await prisma.user.delete({
      where: { id },
    });

    res.status(httpStatus.OK).json(
      new ApiResponse(
        httpStatus.OK,
        'User deleted successfully'
      )
    );
  });
}