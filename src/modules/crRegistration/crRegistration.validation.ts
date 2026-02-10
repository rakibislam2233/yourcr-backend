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

const batchInformation = z.object({
  batchType: z.enum(['SEMESTER', 'YEAR'], { error: 'Batch type must be SEMESTER or YEAR' }),
  department: z.string().min(1, 'Department is required'),
  session: z.string().min(1, 'Session is required'),
  academicYear: z.string().min(1, 'Academic year is required'),
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

// ── FormData Registration (for multipart/form-data) ─────────────────────────────────
const formDataRegistration = z.object({
  body: z.object({
    institutionInfo: jsonString(institutionInfoSchema, 'institutionInfo'),
    batchInformation: jsonString(batchInformation, 'batchInformation'),
    sessionId: z.string().min(1, 'Session ID is required'),
  }),
});

const rejectCRRegistration = z.object({
  body: z.object({
    reason: z.string().min(1, 'Reason is required').optional(),
  }),
});

export const CRRegistrationValidations = {
  formDataRegistration,
  rejectCRRegistration,
};
