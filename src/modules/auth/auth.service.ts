import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import config from '../../config';
import { database } from '../../config/database.config';
import { addEmailToQueue } from '../../queues/email.queue';
import ApiError from '../../utils/ApiError';
import * as jwtHelper from '../../utils/jwt.utils';
import { RedisUtils } from '../../utils/redis.utils';
import {
  IChangePasswordPayload,
  IForgotPasswordPayload,
  ILoginPayload,
  ILogoutPayload,
  IRefreshTokenPayload,
  IRegisterPayload,
  IResendOtpPayload,
  IResetPasswordPayload,
  IVerifyOtpPayload,
} from './auth.interface';
import { UserRepository } from '../user/user.repository';
import { hashPassword } from '../../utils/bcrypt.utils';
import { OtpService } from '../otp/otp.service';
import { OtpType } from '../otp/otp.interface';
import { AUTH_CACHE_KEY, AUTH_CACHE_TTL } from './auth.cache';

// --- Register ---
const register = async (payload: IRegisterPayload) => {
  const { fullName, email, password, phoneNumber } = payload;

  //1.check if user already exists
  const user = await UserRepository.getUserByEmail(email);
  if (user) {
    throw new ApiError(StatusCodes.CONFLICT, 'User already exists');
  }

  //2. Hash password
  const hashedPassword = await hashPassword(password);

  //3. Create user
  const result = await UserRepository.createCR({
    fullName,
    email,
    phoneNumber,
    password: hashedPassword,
  });

  // 4. Create OTP session
  const sessionId = await OtpService.createOtpSession(result, OtpType.EMAIL_VERIFICATION);

  return {
    message: 'User registered successfully! Please verify your email.',
    data: {
      email: result.email,
      sessionId,
    },
  };
};

// --- Login ---
const login = async (payload: ILoginPayload) => {
  const { email, password } = payload;

  // 1. Check lockout
  const lockKey = AUTH_CACHE_KEY.LOGIN_LOCK(email);
  const attemptKey = AUTH_CACHE_KEY.LOGIN_ATTEMPT(email);

  const isLocked = await RedisUtils.existsCache(lockKey);
  if (isLocked) {
    throw new ApiError(
      StatusCodes.TOO_MANY_REQUESTS,
      'Account locked due to too many failed attempts. Try again in 2 minutes.'
    );
  }

  // 2. Check user
  const user = await UserRepository.findUserByEmailWithLatestCr(email);

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  // 3. Verify Password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const attempts = await RedisUtils.incrementCounter(attemptKey);
    if (attempts === 1) {
      await RedisUtils.updateTTL(attemptKey, AUTH_CACHE_TTL.LOGIN_ATTEMPT);
    }

    if (attempts >= 5) {
      await RedisUtils.setCache(lockKey, 'locked', AUTH_CACHE_TTL.LOGIN_LOCK);
      await RedisUtils.deleteCache(attemptKey);
      throw new ApiError(
        StatusCodes.TOO_MANY_REQUESTS,
        `Account locked for ${AUTH_CACHE_TTL.LOGIN_LOCK / 60} minutes.`
      );
    }

    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      `Invalid credentials. ${5 - attempts} attempts remaining.`
    );
  }

  // 4. Successful match - clear attempts
  await RedisUtils.deleteCache(attemptKey);

  // 6. Check Email Verification
  if (!user.isEmailVerified) {
    const otpSessionId = await OtpService.createOtpSession(user, OtpType.EMAIL_VERIFICATION);

    return {
      message: 'Email not verified. A new OTP has been sent to your email.',
      data: {
        isEmailVerified: false,
        sessionId: otpSessionId,
      },
    };
  }

  // 7. Generate tokens
  const accessToken = jwtHelper.generateAccessToken(user.id, user.email, user.role);
  const refreshToken = jwtHelper.generateRefreshToken(user.id, user.email, user.role);

  // Store refresh token in Redis
  await RedisUtils.setCache(
    AUTH_CACHE_KEY.REFRESH_TOKEN(user.id),
    refreshToken,
    AUTH_CACHE_TTL.REFRESH_TOKEN
  );

  return {
    message: 'Login successful',
    data: {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
      },
      tokens: { accessToken, refreshToken },
    },
  };
};

/**
 * --- Verify OTP ---
 */
const verifyOtp = async (payload: IVerifyOtpPayload) => {
  const { sessionId, code } = payload;

  const otpResponse = await OtpService.verifyOtpSession(sessionId, code);

  if (otpResponse.type === OtpType.EMAIL_VERIFICATION) {
    const user = await UserRepository.setUserEmailVerified(otpResponse.email);

    return {
      message: 'Email verified successfully',
      data: {
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }

  if (otpResponse.type === OtpType.RESET_PASSWORD) {
    const user = await UserRepository.getUserByEmail(otpResponse.email);
    if (!user) throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');

    const resetToken = jwtHelper.generateResetPasswordToken(user.id, user.email, user.role);

    return {
      message: 'OTP verified. You can now reset your password.',
      data: { resetToken },
    };
  }

  throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Unknown OTP type');
};

/**
 * --- Resend OTP ---
 * Rate Limit is handled by OtpService
 */
const resendOtp = async (payload: IResendOtpPayload) => {
  await OtpService.resendOtpSession(payload.sessionId);
  return { message: 'OTP resent successfully' };
};

/**
 * --- Forgot Password ---
 */
const forgotPassword = async (payload: IForgotPasswordPayload) => {
  const { email } = payload;
  const user = await UserRepository.getUserByEmail(email);

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'No user found with this email');
  }

  const sessionId = await OtpService.createOtpSession(user, OtpType.RESET_PASSWORD);

  return {
    message: 'Password reset OTP sent to your email.',
    data: { sessionId },
  };
};

/**
 * --- Reset Password ---
 */
const resetPassword = async (payload: IResetPasswordPayload) => {
  const { resetPasswordToken, password } = payload;
  const decoded = jwtHelper.verifyResetPasswordToken(resetPasswordToken);

  const hashedPassword = await bcrypt.hash(password, config.bcrypt.saltRounds);

  await database.user.update({
    where: { id: decoded.userId },
    data: { password: hashedPassword },
  });

  return { message: 'Password reset successful. You can now login.' };
};

/**
 * --- Refresh Token ---
 */
const refreshToken = async (payload: IRefreshTokenPayload) => {
  const decoded = jwtHelper.verifyRefreshToken(payload.refreshToken);

  const savedToken = await RedisUtils.getCache(AUTH_CACHE_KEY.REFRESH_TOKEN(decoded.userId));
  if (savedToken !== payload.refreshToken) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid refresh token');
  }

  const user = await UserRepository.getUserById(decoded.userId);
  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');

  const accessToken = jwtHelper.generateAccessToken(user.id, user.email, user.role);
  return {
    message: 'Token refreshed',
    data: { accessToken },
  };
};

// --- Logout ---
const logout = async (payload: ILogoutPayload) => {
  const decoded = jwtHelper.verifyRefreshToken(payload.refreshToken);
  await RedisUtils.deleteCache(AUTH_CACHE_KEY.REFRESH_TOKEN(decoded.userId));
  return { message: 'Logged out successfully' };
};

// --- Change Password ---
const changePassword = async (userId: string, payload: IChangePasswordPayload) => {
  const { oldPassword, newPassword } = payload;
  // 1. Get user
  const user = await UserRepository.getUserById(userId);
  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');

  // 2. Verify old password
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Old password is incorrect');
  }
  // 3. Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, config.bcrypt.saltRounds);
  // 4. Update password
  await database.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
  return { message: 'Password changed successfully' };
};

export const AuthService = {
  register,
  login,
  verifyOtp,
  forgotPassword,
  resendOtp,
  resetPassword,
  refreshToken,
  logout,
  changePassword,
};
