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
    institutionId: z
      .string({ error: 'Institution ID is required and must be a string' })
      .min(1, 'Institution ID is required'),
    department: z
      .string({ error: 'Department is required and must be a string' })
      .min(1, 'Department is required'),
    program: z
      .string({ error: 'Program is required and must be a string' })
      .min(1, 'Program is required'),
    year: z
      .string({ error: 'Academic year is required and must be a string' })
      .min(1, 'Academic year is required'),
    rollNumber: z
      .string({ error: 'Roll number is required and must be a string' })
      .min(1, 'Roll number is required'),
    studentId: z
      .string({ error: 'Student ID must be a string' })
      .optional(),
    semester: z
      .string({ error: 'Semester must be a string' })
      .optional(),
    batch: z
      .string({ error: 'Batch must be a string' })
      .optional(),
  }),
});

export const UserValidations = {
  createStudent,
};