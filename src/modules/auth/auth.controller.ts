import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import catchAsync from '../../utils/catchAsync';
import httpStatus from 'http-status-codes';
import ApiResponse from '../../utils/ApiResponse';

export class AuthController {
  // Register user
  static register = catchAsync(async (req: Request, res: Response) => {
    const userData = req.body;
    const user = await AuthService.register(userData);

    res.status(httpStatus.CREATED).json(
      new ApiResponse(
        httpStatus.CREATED,
        'User registered successfully',
        user
      )
    );
  });

  // Login user
  static login = catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);

    res.status(httpStatus.OK).json(
      new ApiResponse(
        httpStatus.OK,
        'Login successful',
        result
      )
    );
  });

  // Refresh token
  static refreshToken = catchAsync(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const tokens = await AuthService.refreshToken(refreshToken);

    res.status(httpStatus.OK).json(
      new ApiResponse(
        httpStatus.OK,
        'Token refreshed successfully',
        tokens
      )
    );
  });

  // Logout user
  static logout = catchAsync(async (req: Request, res: Response) => {
    const refreshToken = req.headers.authorization?.replace('Bearer ', '') || '';
    await AuthService.logout(refreshToken);

    res.status(httpStatus.OK).json(
      new ApiResponse(
        httpStatus.OK,
        'Logout successful'
      )
    );
  });

  // Get profile
  static getProfile = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const user = await AuthService.getProfile(userId);

    res.status(httpStatus.OK).json(
      new ApiResponse(
        httpStatus.OK,
        'Profile fetched successfully',
        user
      )
    );
  });

  // Update profile
  static updateProfile = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const updateData = req.body;
    const user = await AuthService.updateProfile(userId, updateData);

    res.status(httpStatus.OK).json(
      new ApiResponse(
        httpStatus.OK,
        'Profile updated successfully',
        user
      )
    );
  });
}