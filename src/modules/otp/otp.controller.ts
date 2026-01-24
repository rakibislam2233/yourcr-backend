import { Request, Response } from 'express';
import { generateOtp, storeOtpInRedis, sendOtpEmail, verifyOtp } from './otp.service';
import catchAsync from '../../utils/catchAsync';
import httpStatus from 'http-status-codes';
import ApiResponse from '../../utils/ApiResponse';

// Generate and send OTP for email verification
export const generateEmailOtp = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;

  // Generate OTP
  const otp = generateOtp();

  // Store OTP in Redis
  await storeOtpInRedis(email, otp, 'email_verification');

  // Send OTP via email
  await sendOtpEmail(email, otp);

  res.status(httpStatus.OK).json(
    new ApiResponse(
      httpStatus.OK,
      'OTP sent successfully to your email',
      { email }
    )
  );
});

// Verify OTP
export const verifyOtpController = catchAsync(async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  // Verify OTP
  const isValid = await verifyOtp(email, otp);

  if (isValid) {
    res.status(httpStatus.OK).json(
      new ApiResponse(
        httpStatus.OK,
        'OTP verified successfully',
        { verified: true }
      )
    );
  }
});

// Resend OTP
export const resendOtp = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;

  // Generate new OTP
  const otp = generateOtp();

  // Store OTP in Redis
  await storeOtpInRedis(email, otp, 'email_verification');

  // Send OTP via email
  await sendOtpEmail(email, otp);

  res.status(httpStatus.OK).json(
    new ApiResponse(
      httpStatus.OK,
      'OTP resent successfully',
      { email }
    )
  );
});