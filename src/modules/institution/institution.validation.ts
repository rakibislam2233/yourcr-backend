import { z } from 'zod';
import { InstitutionType } from '../../shared/enum/institution.enum';

// ── Create Institution ───────────────────────────────────────────────────
const createInstitution = z.object({
  body: z.object({
    name: z
      .string({ error: 'Institution name is required and must be a string' })
      .min(1, 'Institution name is required')
      .max(100, 'Institution name must be less than 100 characters'),
    type: z
      .nativeEnum(InstitutionType, { error: 'Institution type is required' }),
    contactEmail: z
      .string({ error: 'Contact email is required and must be a string' })
      .email('Invalid email format')
      .transform(val => val.toLowerCase()),
    contactPhone: z
      .string({ error: 'Contact phone must be a string' })
      .min(8, 'Contact phone must be at least 8 characters')
      .max(20, 'Contact phone must be less than 20 characters')
      .optional(),
    website: z
      .string({ error: 'Website must be a string' })
      .url('Invalid website URL')
      .optional(),
    address: z
      .string({ error: 'Address is required and must be a string' })
      .min(5, 'Address must be at least 5 characters')
      .max(500, 'Address must be less than 500 characters'),
  }),
});

// ── Update Institution ───────────────────────────────────────────────────
const updateInstitution = z.object({
  body: z.object({
    name: z
      .string({ error: 'Institution name must be a string' })
      .min(1, 'Institution name is required')
      .max(100, 'Institution name must be less than 100 characters')
      .optional(),
    type: z
      .nativeEnum(InstitutionType, { error: 'Invalid institution type' })
      .optional(),
    contactEmail: z
      .string({ error: 'Contact email must be a string' })
      .email('Invalid email format')
      .transform(val => val.toLowerCase())
      .optional(),
    contactPhone: z
      .string({ error: 'Contact phone must be a string' })
      .min(8, 'Contact phone must be at least 8 characters')
      .max(20, 'Contact phone must be less than 20 characters')
      .optional(),
    website: z
      .string({ error: 'Website must be a string' })
      .url('Invalid website URL')
      .optional()
      .or(z.literal('')),
    address: z
      .string({ error: 'Address must be a string' })
      .min(5, 'Address must be at least 5 characters')
      .max(500, 'Address must be less than 500 characters')
      .optional(),
    isVerified: z
      .boolean({ error: 'isVerified must be a boolean' })
      .optional(),
  }),
});

export const InstitutionValidations = {
  createInstitution,
  updateInstitution,
};
