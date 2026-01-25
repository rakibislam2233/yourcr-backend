import { Request, Response } from 'express';
import {
  registerUser,
  loginUser,
  refreshUserToken,
  logoutUser,
  getUserProfile,
  updateUserProfile,
} from './auth.service';
import catchAsync from '../../utils/catchAsync';
import httpStatus from 'http-status-codes';
import ApiResponse from '../../utils/ApiResponse';

// Register user
const register = catchAsync(async (req: Request, res: Response) => {
  const userData = req.body;
  const user = await registerUser(userData);

  res
    .status(httpStatus.CREATED)
    .json(new ApiResponse(httpStatus.CREATED, 'User registered successfully', user));
});

// Login user
const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await loginUser(email, password);

  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, 'Login successful', result));
});

// Refresh token
const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const tokens = await refreshUserToken(refreshToken);

  res
    .status(httpStatus.OK)
    .json(new ApiResponse(httpStatus.OK, 'Token refreshed successfully', tokens));
});

// Logout user
const logout = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.headers.authorization?.replace('Bearer ', '') || '';
  await logoutUser(refreshToken);

  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, 'Logout successful'));
});

// Get profile
const getProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const user = await getUserProfile(userId);

  res
    .status(httpStatus.OK)
    .json(new ApiResponse(httpStatus.OK, 'Profile fetched successfully', user));
});

// Update profile
const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const updateData = req.body;
  const user = await updateUserProfile(userId, updateData);

  res
    .status(httpStatus.OK)
    .json(new ApiResponse(httpStatus.OK, 'Profile updated successfully', user));
});

export const AuthController = {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
};
