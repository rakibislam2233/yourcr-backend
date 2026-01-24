import otpGenerator from 'otp-generator';
import prisma from '../../database/connection';
import { RedisService } from '../../services/redis.service';
import { sendOTPEmail } from '../../services/email.service';
import catchAsync from '../../utils/catchAsync';
import ApiError from '../../utils/ApiError';
import httpStatus from 'http-status-codes';

const OTP_EXPIRY = 10 * 60 * 1000; // 10 minutes

export class OtpService {
  // Generate OTP
  static generateOtp = (): string => {
    return otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });
  };

  // Store OTP in Redis
  static storeOtpInRedis = async (
    email: string,
    otp: string,
    type: string = 'email_verification'
  ): Promise<void> => {
    const key = `otp:${type}:${email}`;
    await RedisService.setex(key, 600, JSON.stringify({ otp, createdAt: Date.now() })); // 10 minutes expiry
  };

  // Get OTP from Redis
  static getOtpFromRedis = async (
    email: string,
    type: string = 'email_verification'
  ): Promise<{ otp: string; createdAt: number } | null> => {
    const key = `otp:${type}:${email}`;
    const data = await RedisService.getCache(key);
    return data ? JSON.parse(data) : null;
  };

  // Delete OTP from Redis
  static deleteOtpFromRedis = async (
    email: string,
    type: string = 'email_verification'
  ): Promise<void> => {
    const key = `otp:${type}:${email}`;
    await RedisService.deleteCache(key);
  };

  // Send OTP email
  static sendOtpEmail = async (email: string, otp: string): Promise<void> => {
    const subject = 'Your OTP Code';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Your OTP Code</h2>
        <p>Hello,</p>
        <p>Your OTP code is:</p>
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
          <h1 style="margin: 0; letter-spacing: 5px; color: #333;">${otp}</h1>
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
        <hr style="margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    `;

    await EmailService.sendEmail({
      to: email,
      subject,
      html,
    });
  };

  // Verify OTP
  static verifyOtp = async (email: string, otp: string): Promise<boolean> => {
    const storedOtpData = await this.getOtpFromRedis(email);
    
    if (!storedOtpData) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'OTP not found or expired');
    }

    if (storedOtpData.otp !== otp) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid OTP');
    }

    // Check if OTP is expired (10 minutes)
    const isExpired = Date.now() - storedOtpData.createdAt > OTP_EXPIRY;
    if (isExpired) {
      await this.deleteOtpFromRedis(email);
      throw new ApiError(httpStatus.BAD_REQUEST, 'OTP has expired');
    }

    // Delete OTP after successful verification
    await this.deleteOtpFromRedis(email);
    return true;
  };
}