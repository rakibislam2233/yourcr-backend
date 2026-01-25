import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import otpGenerator from 'otp-generator';
import config from '../../config';
import { prisma } from '../../config/database.config';
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
  UserRole,
} from './auth.interface';

/**
 * --- Register ---
 * Flow: User -> Address -> Institution -> Session -> CRRegistration
 */
const register = async (payload: IRegisterPayload) => {
  const { personalInfo, institutionInfo, sessionDetails, documentProof } = payload;

  // 1. Check if email already exists
  const isEmailExists = await prisma.user.findUnique({
    where: { email: personalInfo.email },
  });

  if (isEmailExists) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already exists');
  }

  // 2. Hash password
  const hashedPassword = await bcrypt.hash(personalInfo.password, config.bcrypt.saltRounds);

  // 3. Multi-table Transaction
  const result = await prisma.$transaction(async tx => {
    // a. Create User
    const user = await tx.user.create({
      data: {
        fullName: personalInfo.fullName,
        email: personalInfo.email,
        password: hashedPassword,
        phoneNumber: personalInfo.phoneNumber,
        role: UserRole.CR,
      },
    });

    // b. Create/Find Address for Institution
    const address = await tx.address.create({
      data: {
        district: institutionInfo.district,
      },
    });

    // c. Create Institution
    const institution = await tx.institution.create({
      data: {
        name: institutionInfo.name,
        type: institutionInfo.type as any,
        contactEmail: institutionInfo.contactEmail,
        addressId: address.id,
      },
    });

    // d. Create Session
    const session = await tx.session.create({
      data: {
        name: sessionDetails.name,
        sessionType: sessionDetails.sessionType as any,
        department: sessionDetails.department,
        academicYear: sessionDetails.academicYear,
        institutionId: institution.id,
        crId: user.id,
      },
    });

    // e. Create CRRegistration
    const crRegistration = await tx.cRRegistration.create({
      data: {
        userId: user.id,
        institutionId: institution.id,
        sessionId: session.id,
        documentProof: documentProof || '',
        status: 'PENDING',
      },
    });

    return { user, crRegistration };
  });

  // 4. Send "Awaiting Approval" email notification (Queue Job)
  await addEmailToQueue({
    to: personalInfo.email,
    subject: 'Registration Pending Approval',
    html: `<h1>Hello ${personalInfo.fullName}</h1><p>Your registration as a CR is currently pending admin approval. You will be notified once it is approved.</p>`,
  });

  return {
    message: 'User registered successfully! Please wait for admin approval.',
    data: result.user,
  };
};

/**
 * --- Login ---
 * Includes 5-attempt lockout (Redis) and verification checks
 */
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
  const user = await prisma.user.findUnique({
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
  const key = `otp:${sessionId}`;

  const storedData: any = await RedisUtils.getCache(key);
  if (!storedData) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'OTP expired or invalid session');
  }

  if (storedData.otp !== code) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid OTP code');
  }

  if (storedData.type === 'VERIFY_EMAIL') {
    const user = await prisma.user.update({
      where: { email: storedData.email },
      data: { isEmailVerified: true },
    });

    await RedisUtils.deleteCache(key);

    const accessToken = jwtHelper.generateAccessToken(user.id, user.email, user.role);
    const refreshToken = jwtHelper.generateRefreshToken(user.id, user.email, user.role);

    return {
      message: 'Email verified successfully',
      data: {
        user: { id: user.id, email: user.email, role: user.role },
        tokens: { accessToken, refreshToken },
      },
    };
  }

  if (storedData.type === 'RESET_PASSWORD') {
    const user = await prisma.user.findUnique({ where: { email: storedData.email } });
    if (!user) throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');

    const resetToken = jwtHelper.generateResetPasswordToken(user.id, user.email, user.role);
    await RedisUtils.deleteCache(key);

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
  const user = await prisma.user.findUnique({ where: { email } });

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

  await prisma.user.update({
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

  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
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
  const updated = await prisma.$transaction(async tx => {
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
