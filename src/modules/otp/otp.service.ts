import { RedisUtils } from '../../utils/redis.utils';
import { IOtpSession, OtpType } from './otp.interface';
import { generateSecureOtp, generateSessionId } from './otp.utils';
import { AUTH_CACHE_KEY, AUTH_CACHE_TTL } from '../auth/auth.cache';
import { sendResetPasswordEmail, sendVerificationEmail } from '../../utils/emailTemplates';
import ApiError from '../../utils/ApiError';
import { StatusCodes } from 'http-status-codes';

interface IUserPayload {
  id: string;
  email: string;
}

const createOtpSession = async (user: IUserPayload, type: OtpType): Promise<string> => {
  const otp = await generateSecureOtp();
  const sessionId = await generateSessionId(36);

  const sessionData: IOtpSession = {
    userId: user.id,
    email: user.email,
    code: otp.toString(),
    type,
    attempts: 0,
    createdAt: new Date(),
  };

  // Set session in redis
  await RedisUtils.setCache(
    AUTH_CACHE_KEY.OTP_SESSION(sessionId),
    sessionData,
    AUTH_CACHE_TTL.OTP_SESSION
  );

  // Send email asynchronously based on type
  if (type === OtpType.EMAIL_VERIFICATION) {
    await sendVerificationEmail(user.email, otp.toString());
  } else if (type === OtpType.RESET_PASSWORD) {
    await sendResetPasswordEmail(user.email, otp.toString());
  }

  return sessionId;
};

const verifyOtpSession = async (sessionId: string, code: string) => {
  const sessionData = await RedisUtils.getCache<IOtpSession>(AUTH_CACHE_KEY.OTP_SESSION(sessionId));

  if (!sessionData) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid session');
  }

  // Max attempts reached
  if (sessionData.attempts >= 5) {
    await RedisUtils.deleteCache(AUTH_CACHE_KEY.OTP_SESSION(sessionId));
    throw new ApiError(StatusCodes.TOO_MANY_REQUESTS, 'Too many attempts. Please try again later.');
  }

  // Code mismatch
  if (sessionData.code !== code) {
    sessionData.attempts += 1;
    await RedisUtils.setCache(
      AUTH_CACHE_KEY.OTP_SESSION(sessionId),
      sessionData,
      AUTH_CACHE_TTL.OTP_SESSION
    );
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid OTP code');
  }

  return {
    email: sessionData.email,
    type: sessionData.type,
    userId: sessionData.userId,
  };
};

const resendOtpSession = async (sessionId: string) => {
  const sessionData = await RedisUtils.getCache<IOtpSession>(AUTH_CACHE_KEY.OTP_SESSION(sessionId));

  if (!sessionData) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid session');
  }

  // Throttle check (1 minute)
  const timeSinceCreation = Date.now() - new Date(sessionData.createdAt).getTime();
  const COOLDOWN_PERIOD = 60 * 1000;

  if (timeSinceCreation < COOLDOWN_PERIOD) {
    const remainingSeconds = Math.ceil((COOLDOWN_PERIOD - timeSinceCreation) / 1000);
    throw new ApiError(
      StatusCodes.TOO_MANY_REQUESTS,
      `Please wait ${remainingSeconds} seconds before requesting a new OTP.`
    );
  }

  // Generate new OTP and reset attempts
  const otp = await generateSecureOtp();
  sessionData.code = otp.toString();
  sessionData.attempts = 0;
  sessionData.createdAt = new Date();

  await RedisUtils.setCache(
    AUTH_CACHE_KEY.OTP_SESSION(sessionId),
    sessionData,
    AUTH_CACHE_TTL.OTP_SESSION
  );

  // Trigger Email
  if (sessionData.type === OtpType.EMAIL_VERIFICATION) {
    await sendVerificationEmail(sessionData.email, otp.toString());
  } else if (sessionData.type === OtpType.RESET_PASSWORD) {
    await sendResetPasswordEmail(sessionData.email, otp.toString());
  }

  return {
    email: sessionData.email,
  };
};
export const OtpService = {
  createOtpSession,
  verifyOtpSession,
  resendOtpSession,
};
