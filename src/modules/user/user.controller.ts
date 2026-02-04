import { Request, Response } from 'express';
import httpStatus from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { UserService } from './user.service';
import pick from '../../utils/pick.utils';

// Get all users
const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  // Just pick filters and options, pass to service
  const filters = pick(req.query, [
    'fullName',
    'email',
    'phoneNumber',
    'status',
    'role',
    'isEmailVerified',
    'search',
  ]);
  const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']);

  const users = await UserService.getAllUsers(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Users fetched successfully',
    meta: users.pagination,
    data: users.data,
  });
});

// Get user by ID
const getUserById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = Array.isArray(id) ? id[0] : id;

  const user = await UserService.getUserById(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User fetched successfully',
    data: user,
  });
});

// Get user profile with academic info
const getUserProfile = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  const userProfile = await UserService.getUserProfile(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User profile fetched successfully',
    data: userProfile,
  });
});

const createStudent = async (crId: string, studentData: any) => {
  return await UserService.createStudent(crId, studentData);
};

// Update my profile (self)
const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  const result = await UserService.updateMyProfile(userId, req.body, req.file, req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Profile updated successfully',
    data: result,
  });
});

// Update user
const updateUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = Array.isArray(id) ? id[0] : id;

  const user = await UserService.updateUserById(userId, req.body);

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

  await UserService.deleteUserById(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User deleted successfully',
  });
});

const deleteMyProfile = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  await UserService.deleteMyProfile(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Profile deleted successfully',
  });
});

export const UserController = {
  getAllUsers,
  getUserById,
  getUserProfile,
  updateMyProfile,
  createStudent,
  updateUser,
  deleteUser,
  deleteMyProfile
};
