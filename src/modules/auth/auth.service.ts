import bcrypt from 'bcrypt';
import moment from 'moment';
import {
  IForgotPasswordPayload,
  ILoginPayload,
  IRefreshTokenPayload,
  IResendOtpPayload,
  IResetPasswordPayload,
  IVerifyOtpPayload,
} from './auth.interface';
import { AUTH_CACHE_KEY, AUTH_CACHE_TTL } from './auth.redisService';
import ApiError from '@/utils/ApiError';
import { StatusCodes } from 'http-status-codes';
import { RedisUtils } from '@/utils/redis.utils';

// --- Register ---
const register = async (payload: ICreateUserPayload) => {
  if (
    payload.role === UserRole.ADMIN ||
    payload.role === UserRole.Sub_ADMIN ||
    payload.role === UserRole.SUPER_ADMIN
  ) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'You are not allowed to create admin user');
  }
  // 1. Check if email already exists
  const isEmailExists = await UserRepository.isEmailExists(payload?.email);
  if (isEmailExists) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already exists');
  }

  // 2. Validate referral code if provided
  let referrerUser = null;
  if (payload.referralCode) {
    const isValidReferral = await UserUtils.validateReferralCode(payload.referralCode);
    if (!isValidReferral) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid referral code');
    }
    referrerUser = await UserRepository.getUserByReferralCode(payload.referralCode);
  }

  // 3. Generate unique identifiers
  const [customerId, nickname, referralCode] = await Promise.all([
    UserUtils.generateCustomerId(),
    UserUtils.generateNickname(payload.email),
    UserUtils.generateReferralCode(),
  ]);

  // 4. Create user
  const user = await UserRepository.createUser({
    fullName: payload.fullName,
    email: payload.email,
    password: payload.password,
    country: payload.country,
    phoneNumber: payload.phoneNumber,
    customerId,
    nickname,
    referralCode,
    referredBy: referrerUser?._id,
    isVerified: false,
  });

  if (referrerUser) {
    await UserRepository.addReferredUser(referrerUser._id.toString(), user._id.toString());
  }

  // 5. Create OTP session
  const sessionId = await OtpService.createOtpSession(user, OtpType.VERIFY_ACCOUNT);

  return {
    message: 'User registered successfully! Please verify your email.',
    data: {
      email: user.email,
      sessionId,
    },
  };
};

// --- Login ---
const login = async (payload: ILoginPayload) => {
  const user = await UserRepository.getUserByEmailWithPassword(payload.email);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  // Check if user is verified
  if (!user.isVerified) {
    const sessionId = await OtpService.createOtpSession(user, OtpType.VERIFY_ACCOUNT);
    return {
      message: 'Email not verified. Please verify your account first.',
      data: {
        email: user.email,
        sessionId,
        purpose: 'verify-account',
      },
    };
  }

  // Check if account locked
  if (user.lockUntil && user.lockUntil > new Date()) {
    throw new ApiError(StatusCodes.TOO_MANY_REQUESTS, 'Account locked. Please try again later.');
  }

  // Check password
  const isPasswordCorrect = await bcrypt.compare(payload.password, user.password);
  if (!isPasswordCorrect) {
    user.failedLoginAttempts += 1;

    if (user.failedLoginAttempts >= config.auth.maxLoginAttempts) {
      user.lockUntil = moment().add(config.auth.lockTime, 'minutes').toDate();
      await user.save();

      throw new ApiError(StatusCodes.TOO_MANY_REQUESTS, 'Account locked. Please try again later.');
    }

    await user.save();
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid credentials');
  }

  // Reset failed attempts on success
  if (user.failedLoginAttempts > 0) {
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();
  }

  // Generate tokens
  const [accessToken, refreshToken] = await Promise.all([
    jwtHelper.generateAccessToken(user._id.toString(), user.email, user.role),
    jwtHelper.generateRefreshToken(user._id.toString(), user.email, user.role),
  ]);

  // Store refresh token
  await RedisUtils.setCache(
    AUTH_CACHE_KEY.REFRESH_TOKEN(user?._id),
    refreshToken,
    AUTH_CACHE_TTL.REFRESH_TOKEN
  );

  return {
    message: 'Login successful!',
    data: {
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      },
      tokens: { accessToken, refreshToken },
    },
  };
};

// --- OTP Verification ---
const verifyOtp = async (payload: IVerifyOtpPayload) => {
  const { sessionId, code } = payload;
  const otpResponse = await OtpService.verifyOtpSession(sessionId, code);

  const user = await UserRepository.getUserByEmail(otpResponse.email);
  if (!user) {
    throw ApiError.userNotFound();
  }

  if (otpResponse.type === OtpType.VERIFY_ACCOUNT) {
    user.isVerified = true;
    await user.save();
    await RedisUtils.deleteCache(AUTH_CACHE_KEY.OTP_SESSION(sessionId));

    const [accessToken, refreshToken] = await Promise.all([
      jwtHelper.generateAccessToken(user._id.toString(), user.email, user.role),
      jwtHelper.generateRefreshToken(user._id.toString(), user.email, user.role),
    ]);

    await RedisUtils.setCache(
      AUTH_CACHE_KEY.REFRESH_TOKEN(user._id.toString()),
      refreshToken,
      AUTH_CACHE_TTL.REFRESH_TOKEN
    );

    return {
      message: 'Account verified successfully!',
      data: {
        user: { id: user._id.toString(), email: user.email, role: user.role },
        tokens: { accessToken, refreshToken },
      },
    };
  }

  // Forgot password OTP verified
  await RedisUtils.deleteCache(AUTH_CACHE_KEY.OTP_SESSION(sessionId));
  const resetPasswordToken = jwtHelper.generateResetPasswordToken(
    user._id.toString(),
    user.email,
    user.role
  );

  return {
    message: 'OTP verified successfully!',
    data: {
      email: user.email,
      resetPasswordToken,
      purpose: 'forgot-password',
    },
  };
};

// --- Forgot Password ---
const forgotPassword = async (payload: IForgotPasswordPayload) => {
  const user = await UserRepository.getUserByEmail(payload.email);
  if (!user) {
    throw ApiError.userNotFound();
  }

  // Cool down period (1 minute)
  const isLimited = await RedisUtils.getCache(
    AUTH_CACHE_KEY.FORGOT_PASSWORD_LIMIT(user._id.toString())
  );
  if (isLimited) {
    throw ApiError.tooManyRequests('Please wait 1 minute before requesting another email.');
  }

  const sessionId = await OtpService.createOtpSession(user, OtpType.FORGOT_PASSWORD);
  await RedisUtils.setCache(
    AUTH_CACHE_KEY.FORGOT_PASSWORD_LIMIT(user._id.toString()),
    'true',
    60 * 1000
  );

  return {
    message: 'Password reset OTP sent to your email.',
    data: { email: user.email, sessionId },
  };
};

// --- Reset Password ---
const resetPassword = async (payload: IResetPasswordPayload) => {
  const { resetPasswordToken, password } = payload;
  const decoded = jwtHelper.verifyResetPasswordToken(resetPasswordToken);

  const isLimited = await RedisUtils.getCache(AUTH_CACHE_KEY.RESET_PASSWORD_LIMIT(decoded.userId));
  if (isLimited) {
    throw ApiError.tooManyRequests('Please wait 1 minute before resetting again.');
  }

  const user = await UserRepository.getUserById(decoded.userId);
  if (!user) {
    throw ApiError.userNotFound();
  }

  user.password = password;
  await user.save();

  await Promise.all([
    RedisUtils.setCache(AUTH_CACHE_KEY.RESET_PASSWORD_LIMIT(decoded.userId), 'true', 60 * 1000),
    RedisUtils.deleteCache(AUTH_CACHE_KEY.RESET_PASSWORD_TOKEN(decoded.userId)),
  ]);

  return {
    message: 'Password has been reset successfully!',
    data: { email: user.email },
  };
};

// --- Resend OTP ---
const resendOtp = async (payload: IResendOtpPayload) => {
  const result = await OtpService.resendOtpSession(payload.sessionId);
  return {
    message: 'OTP resent successfully!',
    data: { email: result.email, sessionId: payload.sessionId },
  };
};

// --- Refresh Token ---
const refreshToken = async (payload: IRefreshTokenPayload) => {
  const decoded = await jwtHelper.verifyRefreshToken(payload.refreshToken);

  const storedToken = await RedisUtils.getCache(AUTH_CACHE_KEY.REFRESH_TOKEN(decoded.userId));
  if (!storedToken || storedToken !== payload.refreshToken) {
    throw ApiError.unauthorized('Invalid or expired refresh token.');
  }

  const user = await UserRepository.getUserById(decoded.userId);
  if (!user) {
    throw ApiError.userNotFound();
  }

  const [accessToken, newRefreshToken] = await Promise.all([
    jwtHelper.generateAccessToken(user._id.toString(), user.email, user.role),
    jwtHelper.generateRefreshToken(user._id.toString(), user.email, user.role),
  ]);

  await RedisUtils.setCache(
    AUTH_CACHE_KEY.REFRESH_TOKEN(user._id.toString()),
    newRefreshToken,
    AUTH_CACHE_TTL.REFRESH_TOKEN
  );

  return {
    message: 'Tokens refreshed successfully!',
    data: { accessToken, refreshToken: newRefreshToken },
  };
};

// --- Logout ---
const logout = async (accessToken: string) => {
  const decoded = jwtHelper.decodeToken(accessToken);
  if (decoded) {
    await RedisUtils.deleteCache(AUTH_CACHE_KEY.REFRESH_TOKEN(decoded.userId));
    const ttl = decoded.exp! - Math.floor(Date.now() / 1000);
    if (ttl > 0) {
      await RedisUtils.setCache(
        AUTH_CACHE_KEY.BLACKlISTED_TOKEN(accessToken),
        accessToken,
        ttl * 1000
      );
    }
  }
  return {
    message: 'Logged out successfully!',
    data: null,
  };
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
};
