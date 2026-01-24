import otpGenerator from 'otp-generator';
import { sendOTPEmail } from '../../utils/sendEmail';
import { 
  redisSetex, 
  getCache, 
  deleteCache 
} from '../../utils/redis.utils';
import ApiError from '../../utils/ApiError';
import httpStatus from 'http-status-codes';

const OTP_EXPIRY = 10 * 60 * 1000; // 10 minutes

// Generate OTP
export const generateOtp = (): string => {
  return otpGenerator.generate(6, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
};

// Store OTP in Redis
export const storeOtpInRedis = async (
  email: string,
  otp: string,
  type: string = 'email_verification'
): Promise<void> => {
  const key = `otp:${type}:${email}`;
  await redisSetex(key, 600, JSON.stringify({ otp, createdAt: Date.now() })); // 10 minutes expiry
};

// Get OTP from Redis
export const getOtpFromRedis = async (
  email: string,
  type: string = 'email_verification'
): Promise<{ otp: string; createdAt: number } | null> => {
  const key = `otp:${type}:${email}`;
  const data = await getCache(key);
  return data ? JSON.parse(data) : null;
};

// Delete OTP from Redis
export const deleteOtpFromRedis = async (
  email: string,
  type: string = 'email_verification'
): Promise<void> => {
  const key = `otp:${type}:${email}`;
  await deleteCache(key);
};

// Send OTP email
export const sendOtpEmail = async (email: string, otp: string): Promise<void> => {
  await sendOTPEmail(email, otp);
};

// Verify OTP
export const verifyOtp = async (email: string, otp: string): Promise<boolean> => {
  const storedOtpData = await getOtpFromRedis(email);
  
  if (!storedOtpData) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'OTP not found or expired');
  }

  if (storedOtpData.otp !== otp) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid OTP');
  }

  // Check if OTP is expired (10 minutes)
  const isExpired = Date.now() - storedOtpData.createdAt > OTP_EXPIRY;
  if (isExpired) {
    await deleteOtpFromRedis(email);
    throw new ApiError(httpStatus.BAD_REQUEST, 'OTP has expired');
  }

  // Delete OTP after successful verification
  await deleteOtpFromRedis(email);
  return true;
};