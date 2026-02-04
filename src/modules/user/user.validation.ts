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
    rollNumber: z
      .string({ error: 'Roll number is required and must be a string' })
      .min(1, 'Roll number is required'),
    sessionId: z
      .string({ error: 'Session ID is required and must be a string' })
      .min(1, 'Session ID is required'),
    department: z
      .string({ error: 'Department is required and must be a string' })
      .min(1, 'Department is required'),
  }),
});

export const UserValidations = {
  createStudent,
};