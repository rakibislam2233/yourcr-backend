import { z } from 'zod';

// ── Create Batch Enrollment ───────────────────────────────────────────────
const createBatchEnrollmentValidation = z.object({
  body: z.object({
    batchId: z.string().min(1, 'Batch ID is required'),
    userId: z.string().min(1, 'User ID is required'),
    role: z.enum(['STUDENT', 'CR', 'ASSISTANT_CR'], { error: 'Role must be STUDENT, CR, or ASSISTANT_CR' }).default('STUDENT'),
    studentId: z.string().min(1, 'Student ID is required').max(20, 'Student ID must be less than 20 characters').optional(),
  }),
});

// ── Update Batch Enrollment ───────────────────────────────────────────────
const updateBatchEnrollmentValidation = z.object({
  body: z.object({
    role: z.enum(['STUDENT', 'CR', 'ASSISTANT_CR'], { error: 'Role must be STUDENT, CR, or ASSISTANT_CR' }).optional(),
    studentId: z.string().min(1, 'Student ID is required').max(20, 'Student ID must be less than 20 characters').optional(),
    isActive: z.boolean().optional(),
  }),
});

export const BatchEnrollmentValidations = {
  createBatchEnrollmentValidation,
  updateBatchEnrollmentValidation,
};
