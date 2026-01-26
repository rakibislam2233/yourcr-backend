import { z } from 'zod';

// ── Register ────────────────────────────────────────────────────────────────
const register = z.object({
  body: z.object({
    fullName: z
      .string({ error: 'Full name is required and must be a string' })
      .min(1, 'Full name is required'),
    email: z
      .string({ error: 'Email is required and must be a string' })
      .email('Invalid email format')
      .transform(val => val.toLowerCase()),
    password: z
      .string({ error: 'Password is required and must be a string' })
      .min(8, 'Password must be at least 8 characters long'),
    phoneNumber: z
      .string({ error: 'Phone number is required and must be a string' })
      .min(8, 'Phone number must be at least 8 characters'),
  }),
});

// ── Login ───────────────────────────────────────────────────────────────────
const login = z.object({
  body: z.object({
    email: z
      .string({ error: 'Email is required and must be a string' })
      .email('Invalid email format')
      .transform(val => val.toLowerCase()),

    password: z
      .string({ error: 'Password is required and must be a string' })
      .min(1, 'Password is required'),
  }),
});

// ── Verify OTP ──────────────────────────────────────────────────────────────
const verifyOTP = z.object({
  body: z.object({
    sessionId: z
      .string({ error: 'Session ID is required and must be a string' })
      .min(1, 'Session ID is required'),

    code: z
      .string({ error: 'OTP code is required and must be a string' })
      .length(6, 'OTP must be exactly 6 digits')
      .regex(/^\d+$/, 'OTP must contain only digits'),
  }),
});

// ── Forgot Password ─────────────────────────────────────────────────────────
const forgotPassword = z.object({
  body: z.object({
    email: z
      .string({ error: 'Email is required and must be a string' })
      .email('Invalid email format')
      .transform(val => val.toLowerCase()),
  }),
});

// For the rest (resetPassword, resendOtp, etc.) — apply the same pattern

// ── Reset Password ──────────────────────────────────────────────────────────
const resetPassword = z.object({
  body: z.object({
    resetPasswordToken: z
      .string({ error: 'Reset password token is required and must be a string' })
      .min(1, 'Reset password token is required'),

    password: z
      .string({ error: 'New password is required and must be a string' })
      .min(8, 'New password must be at least 8 characters'),
  }),
});

// ── Resend OTP ──────────────────────────────────────────────────────────────
const resendOtp = z.object({
  body: z.object({
    sessionId: z
      .string({ error: 'Session ID is required and must be a string' })
      .min(1, 'Session ID is required'),
  }),
});

// ── Refresh Token / Logout ──────────────────────────────────────────────────
const refreshToken = z.object({
  body: z.object({
    refreshToken: z.string({ error: 'Refresh token is required and must be a string' }),
  }),
});

const logout = z.object({
  body: z.object({
    refreshToken: z.string({ error: 'Refresh token is required and must be a string' }),
  }),
});

// ── Change Password ─────────────────────────────────────────────────────────
const changePassword = z.object({
  body: z.object({
    oldPassword: z
      .string({ error: 'Old password is required and must be a string' })
      .min(1, 'Old password is required'),

    newPassword: z
      .string({ error: 'New password is required and must be a string' })
      .min(8, 'New password must be at least 8 characters'),
  }),
});

export const AuthValidations = {
  register,
  login,
  verifyOTP,
  forgotPassword,
  resetPassword,
  resendOtp,
  refreshToken,
  logout,
  changePassword,
};
