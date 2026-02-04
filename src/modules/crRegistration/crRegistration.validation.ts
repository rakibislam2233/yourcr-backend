import { z } from 'zod';
import { InstitutionType } from '../../shared/enum/institution.enum';

// ── Complete CR Registration ───────────────────────────────────────────────────
const completeRegistration = z.object({
  body: z.object({
    institutionInfo: z.object({
      name: z
        .string({ error: 'Institution name is required and must be a string' })
        .min(1, 'Institution name is required'),
      type: z.nativeEnum(InstitutionType, {
        error: 'Invalid institution type',
      }),
      contactEmail: z
        .string({ error: 'Contact email is required and must be a string' })
        .email('Invalid contact email format')
        .transform(val => val.toLowerCase()),
      contactPhone: z
        .string({ error: 'Contact phone must be a string' })
        .optional(),
      address: z
        .string({ error: 'Address is required and must be a string' })
        .min(1, 'Address is required'),
    }),
    // Version 1: Simple Program Info
    programInfo: z.object({
      programName: z
        .string({ error: 'Program name is required and must be a string' })
        .min(1, 'Program name is required'),
      department: z
        .string({ error: 'Department is required and must be a string' })
        .min(1, 'Department is required'),
      academicYear: z
        .string({ error: 'Academic year is required and must be a string' })
        .min(1, 'Academic year is required'),
    }),
    documentProof: z
      .string({ error: 'Document proof is required and must be a string' })
      .min(1, 'Document proof is required'),
  }),
});

export const CRRegistrationValidations = {
  completeRegistration,
};
