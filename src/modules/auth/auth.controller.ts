import { Request, Response } from 'express';
import httpStatus from 'http-status-codes';
import ApiResponse from '../../utils/ApiResponse';
import catchAsync from '../../utils/catchAsync';
import { AuthService } from './auth.service';

const register = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.register(req.body);
  res
    .status(httpStatus.CREATED)
    .json(new ApiResponse(httpStatus.CREATED, result.message, result.data));
});

const login = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.login(req.body);
  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, result.message, result.data));
});

const verifyOtp = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.verifyOtp(req.body);
  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, result.message, result.data));
});

const resendOtp = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.resendOtp(req.body);
  res
    .status(httpStatus.OK)
    .json(new ApiResponse(httpStatus.OK, result.message, (result as any).data));
});

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.forgotPassword(req.body);
  res
    .status(httpStatus.OK)
    .json(new ApiResponse(httpStatus.OK, result.message, (result as any).data));
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.resetPassword(req.body);
  res
    .status(httpStatus.OK)
    .json(new ApiResponse(httpStatus.OK, result.message, (result as any).data));
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.refreshToken(req.body);
  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, result.message, result.data));
});

export const AuthController = {
  register,
  login,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  refreshToken,
};
