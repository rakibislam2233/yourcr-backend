import { Request, Response } from 'express';
import { OtpService } from './otp.service';
import catchAsync from '../../utils/catchAsync';
import httpStatus from 'http-status-codes';
import ApiResponse from '../../utils/ApiResponse';

export class OtpController {
  // Generate and send OTP for email verification
  static generateEmailOtp = catchAsync(async (req: Request, res: Response) => {
    const { email } = req.body;

    // Generate OTP
    const otp = OtpService.generateOtp();

    // Store OTP in Redis
    await OtpService.storeOtpInRedis(email, otp, 'email_verification');

    // Send OTP via email (this will be processed by BullMQ worker)
    await OtpService.sendOtpEmail(email, otp);

    res.status(httpStatus.OK).json(
      new ApiResponse(
        httpStatus.OK,
        'OTP sent successfully to your email',
        { email }
      )
    );
  });

  // Verify OTP
  static verifyOtp = catchAsync(async (req: Request, res: Response) => {
    const { email, otp } = req.body;

    // Verify OTP
    const isValid = await OtpService.verifyOtp(email, otp);

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
  static resendOtp = catchAsync(async (req: Request, res: Response) => {
    const { email } = req.body;

    // Generate new OTP
    const otp = OtpService.generateOtp();

    // Store OTP in Redis
    await OtpService.storeOtpInRedis(email, otp, 'email_verification');

    // Send OTP via email
    await OtpService.sendOtpEmail(email, otp);

    res.status(httpStatus.OK).json(
      new ApiResponse(
        httpStatus.OK,
        'OTP resent successfully',
        { email }
      )
    );
  });
}