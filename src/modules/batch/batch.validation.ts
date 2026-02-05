import { z } from 'zod';

const createBatchValidation = z.object({
  institutionId: z.string().min(1, 'Institution ID is required'),
  name: z.string().min(1, 'Batch name is required'),
  batchType: z.enum(['SEMESTER', 'YEAR']),
  department: z.string().min(1, 'Department is required'),
  academicYear: z.string().min(1, 'Academic year is required'),
  crId: z.string().min(1, 'CR ID is required'),
});

const updateBatchValidation = z.object({
  name: z.string().min(1, 'Batch name is required').optional(),
  batchType: z.enum(['SEMESTER', 'YEAR']).optional(),
  department: z.string().min(1, 'Department is required').optional(),
  academicYear: z.string().min(1, 'Academic year is required').optional(),
  crId: z.string().min(1, 'CR ID is required').optional(),
  isActive: z.boolean().optional(),
  isArchived: z.boolean().optional(),
});

const createBatchEnrollmentValidation = z.object({
  batchId: z.string().min(1, 'Batch ID is required'),
  studentId: z.string().min(1, 'Student ID is required'),
  studentRollNumber: z.string().min(1, 'Roll number is required'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'REMOVED']).optional(),
});

const updateBatchEnrollmentValidation = z.object({
  studentRollNumber: z.string().min(1, 'Roll number is required').optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'REMOVED']).optional(),
});

export const BatchValidations = {
  createBatchValidation,
  updateBatchValidation,
  createBatchEnrollmentValidation,
  updateBatchEnrollmentValidation,
};
