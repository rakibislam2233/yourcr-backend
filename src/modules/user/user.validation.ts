import { z } from 'zod';
import { InstitutionType } from '../../../prisma/generated/enums';

export const institutionInfoSchema = z.object({
  name: z.string().optional(),
  shortName: z.string().optional(),
  establishedYear: z.coerce.number().optional(),
  type: z
    .nativeEnum(InstitutionType, {
      error: 'Invalid institution type',
    })
    .optional(),
  contactEmail: z
    .string()
    .email('Invalid contact email format')
    .transform(v => v.toLowerCase()),
  contactPhone: z.string().optional(),
  website: z.string().optional(),
  address: z.string().optional(),
  logo: z.string().optional(),
});

export const batchInformationSchema = z.object({
  batchType: z
    .enum(['SEMESTER', 'YEAR'], { error: 'Batch type must be SEMESTER or YEAR' })
    .optional(),
  department: z.string().min(1, 'Department is required').optional(),
  session: z.string().min(1, 'Session is required').optional(),
  academicYear: z.string().min(1, 'Academic year is required').optional(),
  semester: z.string().optional(),
  shift: z.string().optional(),
  group: z.string().optional(),
});

const jsonString = <T extends z.ZodTypeAny>(schema: T, fieldName: string) =>
  z
    .string()
    .min(1)
    .superRefine((val, ctx) => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(val);
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${fieldName} must be valid JSON`,
        });
        return;
      }

      const result = schema.safeParse(parsed);
      if (!result.success) {
        for (const issue of result.error.issues) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: issue.message,
            path: issue.path,
          });
        }
      }
    });

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

// update institution and batch
const updateInstitutionAndBatch = z.object({
  body: z.object({
    institutionInfo: jsonString(institutionInfoSchema, 'institutionInfo'),
    batchInformation: jsonString(batchInformationSchema, 'batchInformation'),
  }),
});

export const UserValidations = {
  createStudent,
  updateMyProfile,
  updateInstitutionAndBatch,
};
