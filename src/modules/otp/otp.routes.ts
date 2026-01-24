import { Router } from 'express';
import { OtpController } from './otp.controller';
import validateRequest from '../../middleware/validation.middleware';
import { OtpValidation } from './otp.validation';

const router = Router();

// Generate OTP for email verification
router.post(
  '/generate-email-otp',
  validateRequest(OtpValidation.generateEmailOtp),
  OtpController.generateEmailOtp
);

// Verify OTP
router.post(
  '/verify-otp',
  validateRequest(OtpValidation.verifyOtp),
  OtpController.verifyOtp
);

// Resend OTP
router.post(
  '/resend-otp',
  validateRequest(OtpValidation.resendOtp),
  OtpController.resendOtp
);

export default router;