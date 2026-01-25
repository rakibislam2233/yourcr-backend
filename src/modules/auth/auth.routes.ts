import { Router } from 'express';
import validateRequest from '../../middleware/validation.middleware';
import { AuthValidations } from './auth.validation';
import { AuthController } from './auth.controller';

const router = Router();

// Register user
router.post('/register', validateRequest(AuthValidations.register), AuthController.register);

// Login user
router.post('/login', validateRequest(AuthValidations.login), AuthController.login);

// OTP Verification
router.post('/verify-otp', validateRequest(AuthValidations.verifyOTP), AuthController.verifyOtp);
router.post('/resend-otp', validateRequest(AuthValidations.resendOtp), AuthController.resendOtp);

// Password Management
router.post(
  '/forgot-password',
  validateRequest(AuthValidations.forgotPassword),
  AuthController.forgotPassword
);
router.post(
  '/reset-password',
  validateRequest(AuthValidations.resetPassword),
  AuthController.resetPassword
);

// Token Management
router.post(
  '/refresh-token',
  validateRequest(AuthValidations.refreshToken),
  AuthController.refreshToken
);

export const AuthRoutes = router;
