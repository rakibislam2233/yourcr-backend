import { z } from 'zod';

// Helper to mimic v3 required + invalid_type behavior
const requiredString = (fieldName: string) =>
  z.string({
    error: iss => {
      if (iss.code === 'invalid_type') {
        if (iss.received === 'undefined' || iss.received === 'null') {
          return `${fieldName} is required`;
        }
        return `${fieldName} must be a string`;
      }
      return iss.message ?? `Invalid ${fieldName.toLowerCase()}`;
    },
  });

// ── Register ────────────────────────────────────────────────────────────────
const register = z.object({
  body: z.object({
    fullName: requiredString('Full name').min(2, 'Full name must be at least 2 characters'),
    email: requiredString('Email')
      .email('Invalid email format')
      .transform(val => val.toLowerCase()),
    password: requiredString('Password').min(8, 'Password must be at least 8 characters long'),
    phoneNumber: requiredString('Phone number').min(
      8,
      'Phone number must be at least 8 characters'
    ),
  }),
});

// ── Login ───────────────────────────────────────────────────────────────────
const login = z.object({
  body: z.object({
    email: requiredString('Email')
      .email('Invalid email format')
      .transform(val => val.toLowerCase()),

    password: requiredString('Password').min(1, 'Password is required'),
  }),
});

// ── Verify OTP ──────────────────────────────────────────────────────────────
const verifyOTP = z.object({
  body: z.object({
    sessionId: requiredString('Session ID').min(1, 'Session ID is required'),

    code: requiredString('OTP code')
      .length(6, 'OTP must be exactly 6 digits')
      .regex(/^\d+$/, 'OTP must contain only digits'),
  }),
});

// ── Forgot Password ─────────────────────────────────────────────────────────
const forgotPassword = z.object({
  body: z.object({
    email: requiredString('Email')
      .email('Invalid email format')
      .transform(val => val.toLowerCase()),
  }),
});

// For the rest (resetPassword, resendOtp, etc.) — apply the same pattern

// ── Reset Password ──────────────────────────────────────────────────────────
const resetPassword = z.object({
  body: z.object({
    resetPasswordToken: requiredString('Reset password token').min(
      1,
      'Reset password token is required'
    ),

    password: requiredString('New password').min(8, 'New password must be at least 8 characters'),
  }),
});

// ── Resend OTP ──────────────────────────────────────────────────────────────
const resendOtp = z.object({
  body: z.object({
    sessionId: requiredString('Session ID').min(1, 'Session ID is required'),
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
    oldPassword: requiredString('Old password').min(1, 'Old password is required'),

    newPassword: requiredString('New password').min(
      8,
      'New password must be at least 8 characters'
    ),
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
