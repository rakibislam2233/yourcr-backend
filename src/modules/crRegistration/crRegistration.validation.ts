import { z } from 'zod';
import { InstitutionType } from '../../shared/enum/institution.enum';

const institutionInfoSchema = z.object({
  name: z.string().min(1, 'Institution name is required'),
  type: z.nativeEnum(InstitutionType, {
    error: 'Invalid institution type',
  }),
  contactEmail: z
    .string()
    .email('Invalid contact email format')
    .transform(v => v.toLowerCase()),
  contactPhone: z.string().optional(),
  address: z.string().min(1, 'Address is required'),
});

const academicInfoSchema = z.object({
  program: z.string().min(1, 'Program is required'),
  year: z.string().min(1, 'Academic year is required'),
  semester: z.string().min(1, 'Semester is required'),
  department: z.string().min(1, 'Department is required'),
  studentId: z.string().optional(),
  batch: z.string().optional(),
});

const jsonString = <T extends z.ZodTypeAny>(schema: T, fieldName: string) =>
  z.string().min(1).superRefine((val, ctx) => {
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

// ── FormData Registration (for multipart/form-data) ─────────────────────────────────
const formDataRegistration = z.object({
  body: z.object({
    institutionInfo: jsonString(institutionInfoSchema, 'institutionInfo'),
    academicInfo: jsonString(academicInfoSchema, 'academicInfo'),
  }),
});

export const CRRegistrationValidations = {
  formDataRegistration,
};
