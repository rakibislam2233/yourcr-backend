import { Router } from 'express';
import validateRequest from '../../middleware/validation.middleware';
import { AuthValidations } from './auth.validation';
import { AuthController } from './auth.controller';
import {
  registerRateLimiter,
  loginRateLimiter,
  verifyOtpRateLimiter,
  resendOtpRateLimiter,
  forgotPasswordRateLimiter,
  resetPasswordRateLimiter,
  refreshTokenRateLimiter,
} from '../../middleware/rate-limit.middleware';
import { auth } from '../../middleware/auth.middleware';
import { UserRole } from '../../../prisma/generated/enums';

const router = Router();

// Register user
router.post(
  '/register',
  registerRateLimiter,
  validateRequest(AuthValidations.register),
  AuthController.register
);

// Login user
router.post(
  '/login',
  loginRateLimiter,
  validateRequest(AuthValidations.login),
  AuthController.login
);

// OTP Verification
router.post(
  '/verify-otp',
  verifyOtpRateLimiter,
  validateRequest(AuthValidations.verifyOTP),
  AuthController.verifyOtp
);
router.post(
  '/resend-otp',
  resendOtpRateLimiter,
  validateRequest(AuthValidations.resendOtp),
  AuthController.resendOtp
);

// Password Management
router.post(
  '/forgot-password',
  forgotPasswordRateLimiter,
  validateRequest(AuthValidations.forgotPassword),
  AuthController.forgotPassword
);
router.post(
  '/reset-password',
  resetPasswordRateLimiter,
  validateRequest(AuthValidations.resetPassword),
  AuthController.resetPassword
);

// Token Management
router.post(
  '/refresh-token',
  refreshTokenRateLimiter,
  validateRequest(AuthValidations.refreshToken),
  AuthController.refreshToken
);

router.post('/logout', validateRequest(AuthValidations.logout), AuthController.logout);

router.post(
  '/change-password',
  auth(UserRole.STUDENT, UserRole.CR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(AuthValidations.changePassword),
  AuthController.changePassword
);

export const AuthRoutes = router;
