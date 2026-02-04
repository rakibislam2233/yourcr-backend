import { Request, Response } from 'express';
import httpStatus from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import { AuthService } from './auth.service';
import sendResponse from '../../utils/sendResponse';
import ApiError from '../../utils/ApiError';

const register = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.register(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result.data,
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.login(req.body, req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result.data,
  });
});

const verifyOtp = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.verifyOtp(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result.data,
  });
});

const resendOtp = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.resendOtp(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
  });
});

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.forgotPassword(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result.data,
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.resetPassword(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.refreshToken(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result.data,
  });
});

const logout = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.logout(req.body, req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  if (!userId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'User not authenticated');
  }
  const result = await AuthService.changePassword(userId, req.body, req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
  });
});
export const AuthController = {
  register,
  login,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout,
  changePassword,
};
