import { z } from 'zod';

export const OtpValidation = {
  generateEmailOtp: z.object({
    body: z.object({
      email: z.string().email('Invalid email format'),
    }),
  }),

  verifyOtp: z.object({
    body: z.object({
      email: z.string().email('Invalid email format'),
      otp: z.string().length(6, 'OTP must be 6 digits'),
    }),
  }),

  resendOtp: z.object({
    body: z.object({
      email: z.string().email('Invalid email format'),
    }),
  }),
};