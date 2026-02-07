import { z } from 'zod';

// ── Create Student (by CR) ───────────────────────────────────────────────────
const createStudent = z.object({
  body: z.object({
    fullName: z
      .string({ error: 'Full name is required and must be a string' })
      .min(1, 'Full name is required'),
    email: z
      .string({ error: 'Email is required and must be a string' })
      .email('Invalid email format')
      .transform(val => val.toLowerCase()),
    phoneNumber: z
      .string({ error: 'Phone number is required and must be a string' })
      .min(8, 'Phone number must be at least 8 characters'),
    studentId: z
      .string({ error: 'Student ID is required and must be a string' })
      .min(1, 'Student ID is required')
      .optional(),
    institutionId: z
      .string({ error: 'Institution ID is required and must be a string' })
      .min(1, 'Institution ID is required')
      .optional(),
    batchId: z
      .string({ error: 'Batch ID is required and must be a string' })
      .min(1, 'Batch ID is required')
      .optional(),
  }),
});

// ── Update My Profile (multipart/form-data friendly) ──────────────────────────
const updateMyProfile = z.object({
  body: z.object({
    fullName: z.string({ error: 'Full name must be a string' }).optional(),
    phoneNumber: z.string({ error: 'Phone number must be a string' }).optional(),
    bio: z.string({ error: 'Bio must be a string' }).optional(),
    dateOfBirth: z.string({ error: 'Date of birth must be a string' }).optional(),
  }),
});

export const UserValidations = {
  createStudent,
  updateMyProfile,
};
