import { z } from 'zod';

// ── Create Batch ───────────────────────────────────────────────────
const createBatchValidation = z.object({
  body: z.object({
    institutionId: z.string().min(1, 'Institution ID is required'),
    batchType: z.enum(['SEMESTER', 'YEAR'], { error: 'Batch type must be SEMESTER or YEAR' }),
    department: z
      .string()
      .min(1, 'Department is required')
      .max(100, 'Department must be less than 100 characters'),
    session: z
      .string()
      .min(1, 'Session is required')
      .max(50, 'Session must be less than 50 characters'),
    academicYear: z
      .string()
      .min(1, 'Academic year is required')
      .max(20, 'Academic year must be less than 20 characters'),
    semester: z.string().max(50, 'Semester must be less than 50 characters').optional(),
    shift: z.string().max(50, 'Shift must be less than 50 characters').optional(),
    group: z.string().max(50, 'Group must be less than 50 characters').optional(),
  }),
});

// ── Update Batch ───────────────────────────────────────────────────
const updateBatchValidation = z.object({
  body: z.object({
    batchType: z
      .enum(['SEMESTER', 'YEAR'], { error: 'Batch type must be SEMESTER or YEAR' })
      .optional(),
    department: z
      .string()
      .min(1, 'Department is required')
      .max(100, 'Department must be less than 100 characters')
      .optional(),
    session: z
      .string()
      .min(1, 'Session is required')
      .max(50, 'Session must be less than 50 characters')
      .optional(),
    academicYear: z
      .string()
      .min(1, 'Academic year is required')
      .max(20, 'Academic year must be less than 20 characters')
      .optional(),
    semester: z.string().max(50, 'Semester must be less than 50 characters').optional(),
    shift: z.string().max(50, 'Shift must be less than 50 characters').optional(),
    group: z.string().max(50, 'Group must be less than 50 characters').optional(),
    isActive: z.boolean().optional(),
    isArchived: z.boolean().optional(),
  }),
});

// ── Create Batch Enrollment ───────────────────────────────────────────
const createBatchEnrollmentValidation = z.object({
  body: z.object({
    batchId: z.string().min(1, 'Batch ID is required'),
    userId: z.string().min(1, 'User ID is required'),
    role: z
      .enum(['STUDENT', 'CR', 'ASSISTANT_CR'], {
        error: 'Role must be STUDENT, CR, or ASSISTANT_CR',
      })
      .default('STUDENT'),
    studentId: z
      .string()
      .min(1, 'Student ID is required')
      .max(20, 'Student ID must be less than 20 characters')
      .optional(),
  }),
});

// ── Update Batch Enrollment ───────────────────────────────────────────
const updateBatchEnrollmentValidation = z.object({
  body: z.object({
    role: z
      .enum(['STUDENT', 'CR', 'ASSISTANT_CR'], {
        error: 'Role must be STUDENT, CR, or ASSISTANT_CR',
      })
      .optional(),
    studentId: z
      .string()
      .min(1, 'Student ID is required')
      .max(20, 'Student ID must be less than 20 characters')
      .optional(),
    isActive: z.boolean().optional(),
  }),
});

// ── Check Existing Batch (for CR registration) ──────────────────────
const checkExistingBatchValidation = z.object({
  query: z.object({
    institutionId: z.string().min(1, 'Institution ID is required'),
    department: z.string().min(1, 'Department is required'),
    session: z.string().min(1, 'Session is required'),
    batchType: z.enum(['SEMESTER', 'YEAR'], { error: 'Batch type must be SEMESTER or YEAR' }),
    academicYear: z.string().min(1, 'Academic year is required'),
    semester: z.string().optional(),
    shift: z.string().optional(),
    group: z.string().optional(),
  }),
});

export const BatchValidations = {
  createBatchValidation,
  updateBatchValidation,
  createBatchEnrollmentValidation,
  updateBatchEnrollmentValidation,
  checkExistingBatchValidation,
};
