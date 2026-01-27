import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import otpGenerator from 'otp-generator';
import config from '../../config';
import { database } from '../../config/database.config';
import { addEmailToQueue } from '../../queues/email.queue';
import ApiError from '../../utils/ApiError';
import * as jwtHelper from '../../utils/jwt.utils';
import { RedisUtils } from '../../utils/redis.utils';
import {
  IForgotPasswordPayload,
  ILoginPayload,
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
import { AUTH_CACHE_KEY } from './auth.cache';

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

  // 5. Create OTP session
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
  const lockKey = `login_lock:${email}`;
  const attemptKey = `login_attempts:${email}`;

  const isLocked = await RedisUtils.existsCache(lockKey);
  if (isLocked) {
    throw new ApiError(
      StatusCodes.TOO_MANY_REQUESTS,
      'Account locked due to too many failed attempts. Try again in 2 minutes.'
    );
  }

  // 2. Check user
  const user = await database.user.findUnique({
    where: { email },
    include: {
      crRegistrations: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  // 3. Verify Password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const attempts = await RedisUtils.incrementCounter(attemptKey);
    if (attempts === 1) {
      await RedisUtils.updateTTL(attemptKey, 120); // 2 mins window for attempts
    }

    if (attempts >= 5) {
      await RedisUtils.setCache(lockKey, 'locked', 120000); // 2 mins lock
      await RedisUtils.deleteCache(attemptKey);
      throw new ApiError(StatusCodes.TOO_MANY_REQUESTS, 'Account locked for 2 minutes.');
    }

    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      `Invalid credentials. ${5 - attempts} attempts remaining.`
    );
  }

  // 4. Successful match - clear attempts
  await RedisUtils.deleteCache(attemptKey);

  // 5. Check Approval Status
  const registration = user.crRegistrations[0];
  if (!registration || registration.status === 'PENDING') {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Your registration is still pending admin approval.');
  }
  if (registration.status === 'REJECTED') {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Your registration has been rejected.');
  }

  // 6. Check Email Verification
  if (!user.isEmailVerified) {
    // Generate OTP for verification
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });
    const otpSessionId = `otp_sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store in Redis (10 mins)
    await RedisUtils.setCache(
      `otp:${otpSessionId}`,
      { email: user.email, otp, type: 'VERIFY_EMAIL' },
      600000
    );

    // Queue OTP email
    await addEmailToQueue({
      to: user.email,
      subject: 'Verify your email',
      html: `<h1>Your OTP: ${otp}</h1><p>Expires in 10 minutes.</p>`,
    });

    return {
      message: 'Email not verified. OTP sent to your email.',
      data: {
        isEmailVerified: false,
        otpSessionId,
      },
    };
  }

  // 7. Generate tokens
  const accessToken = jwtHelper.generateAccessToken(user.id, user.email, user.role);
  const refreshToken = jwtHelper.generateRefreshToken(user.id, user.email, user.role);

  // Store refresh token in Redis
  await RedisUtils.setCache(`refresh_token:${user.id}`, refreshToken, 7 * 24 * 3600 * 1000); // 7 days

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

  // check if user exists
  const user = await UserRepository.getUserByEmail(otpResponse.email);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  if (otpResponse.type === OtpType.EMAIL_VERIFICATION) {
    const user = await database.user.update({
      where: { email: otpResponse.email },
      data: { isEmailVerified: true },
    });

    await RedisUtils.deleteCache(AUTH_CACHE_KEY.OTP_SESSION(sessionId));

    return {
      message: 'Email verified successfully',
      data: {
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }

  if (otpResponse.type === OtpType.RESET_PASSWORD) {
    const user = await database.user.findUnique({ where: { email: otpResponse.email } });
    if (!user) throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
    const resetToken = jwtHelper.generateResetPasswordToken(user.id, user.email, user.role);
    await RedisUtils.deleteCache(AUTH_CACHE_KEY.OTP_SESSION(sessionId));
    return {
      message: 'OTP verified. You can now reset your password.',
      data: { resetToken },
    };
  }

  throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Unknown OTP type');
};

/**
 * --- Resend OTP ---
 * Rate Limit: 1 minute
 */
const resendOtp = async (payload: IResendOtpPayload) => {
  const { sessionId } = payload;
  const key = `otp:${sessionId}`;
  const rateLimitKey = `resend_limit:${sessionId}`;

  const isLimited = await RedisUtils.existsCache(rateLimitKey);
  if (isLimited) {
    throw new ApiError(StatusCodes.TOO_MANY_REQUESTS, 'Please wait 1 minute before resending OTP.');
  }

  const storedData: any = await RedisUtils.getCache(key);
  if (!storedData) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid session');
  }

  const newOtp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });
  storedData.otp = newOtp;
  await RedisUtils.setCache(key, storedData, 600000);
  await RedisUtils.setCache(rateLimitKey, 'limited', 60000); // 1 min limit

  await addEmailToQueue({
    to: storedData.email,
    subject: 'Your new OTP',
    html: `<h1>Your New OTP: ${newOtp}</h1>`,
  });

  return { message: 'OTP resent successfully' };
};

/**
 * --- Forgot Password ---
 */
const forgotPassword = async (payload: IForgotPasswordPayload) => {
  const { email } = payload;
  const user = await database.user.findUnique({ where: { email } });

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'No user found with this email');
  }

  const otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });
  const sessionId = `pwd_sess_${Date.now()}`;

  await RedisUtils.setCache(`otp:${sessionId}`, { email, otp, type: 'RESET_PASSWORD' }, 600000);

  await addEmailToQueue({
    to: email,
    subject: 'Password Reset OTP',
    html: `<h1>Your Password Reset OTP: ${otp}</h1>`,
  });

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

  const savedToken = await RedisUtils.getCache(`refresh_token:${decoded.userId}`);
  if (savedToken !== payload.refreshToken) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid refresh token');
  }

  const user = await database.user.findUnique({ where: { id: decoded.userId } });
  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');

  const accessToken = jwtHelper.generateAccessToken(user.id, user.email, user.role);
  return {
    message: 'Token refreshed',
    data: { accessToken },
  };
};

/**
 * Extra: Admin approve user (to allow login)
 */
export const approveUser = async (userId: string) => {
  const updated = await database.$transaction(async tx => {
    const registration = await tx.cRRegistration.findFirst({
      where: { userId, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    });
    if (!registration) throw new ApiError(StatusCodes.NOT_FOUND, 'No pending registration found');

    return await tx.cRRegistration.update({
      where: { id: registration.id },
      data: { status: 'APPROVED' },
      include: { user: true },
    });
  });

  await addEmailToQueue({
    to: updated.user.email,
    subject: 'Account Approved',
    html: `<h1>Congratulations!</h1><p>Your CR account has been approved by admin. You can now login.</p>`,
  });

  return updated;
};

export const AuthService = {
  register,
  login,
  verifyOtp,
  forgotPassword,
  resendOtp,
  resetPassword,
  refreshToken,
  approveUser,
};
