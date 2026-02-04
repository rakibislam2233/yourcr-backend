import { z } from 'zod';
import { InstitutionType } from '../../shared/enum/institution.enum';

// ── Create Institution ───────────────────────────────────────────────────
const createInstitution = z.object({
  body: z.object({
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
    website: z
      .string({ error: 'Website must be a string' })
      .url('Invalid website format')
      .optional(),
    address: z
      .string({ error: 'Address is required and must be a string' })
      .min(1, 'Address is required'),
    logo: z
      .string({ error: 'Logo must be a string' })
      .optional(),
  }),
});

// ── Update Institution ───────────────────────────────────────────────────
const updateInstitution = z.object({
  body: z.object({
    name: z
      .string({ error: 'Institution name must be a string' })
      .min(1, 'Institution name is required')
      .optional(),
    type: z.nativeEnum(InstitutionType, {
      error: 'Invalid institution type',
    }).optional(),
    contactEmail: z
      .string({ error: 'Contact email must be a string' })
      .email('Invalid contact email format')
      .transform(val => val.toLowerCase())
      .optional(),
    contactPhone: z
      .string({ error: 'Contact phone must be a string' })
      .optional(),
    website: z
      .string({ error: 'Website must be a string' })
      .url('Invalid website format')
      .optional(),
    address: z
      .string({ error: 'Address must be a string' })
      .min(1, 'Address is required')
      .optional(),
    logo: z
      .string({ error: 'Logo must be a string' })
      .optional(),
    isVerified: z
      .boolean({ error: 'Is verified must be a boolean' })
      .optional(),
  }),
});

export const InstitutionValidations = {
  createInstitution,
  updateInstitution,
};
