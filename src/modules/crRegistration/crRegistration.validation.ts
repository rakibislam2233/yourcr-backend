import { z } from 'zod';
import { InstitutionType } from '../../shared/enum/institution.enum';

// ── FormData Registration (for multipart/form-data) ─────────────────────────────────
const formDataRegistration = z.object({
  body: z.object({
    'institutionInfo[name]': z
      .string({ error: 'Institution name is required and must be a string' })
      .min(1, 'Institution name is required'),
    'institutionInfo[type]': z.nativeEnum(InstitutionType, {
      error: 'Invalid institution type',
    }),
    'institutionInfo[contactEmail]': z
      .string({ error: 'Contact email is required and must be a string' })
      .email('Invalid contact email format')
      .transform(val => val.toLowerCase()),
    'institutionInfo[contactPhone]': z
      .string({ error: 'Contact phone must be a string' })
      .optional(),
    'institutionInfo[address]': z
      .string({ error: 'Address is required and must be a string' })
      .min(1, 'Address is required'),
    'academicInfo[program]': z
      .string({ error: 'Program is required and must be a string' })
      .min(1, 'Program is required'),
    'academicInfo[year]': z
      .string({ error: 'Academic year is required and must be a string' })
      .min(1, 'Academic year is required'),
    'academicInfo[semester]': z
      .string({ error: 'Semester is required and must be a string' })
      .min(1, 'Semester is required'),
    'academicInfo[department]': z
      .string({ error: 'Department is required and must be a string' })
      .min(1, 'Department is required'),
    'academicInfo[studentId]': z.string({ error: 'Student ID must be a string' }).optional(),
    'academicInfo[batch]': z.string({ error: 'Batch must be a string' }).optional(),
  }),
});

export const CRRegistrationValidations = {
  formDataRegistration,
};
