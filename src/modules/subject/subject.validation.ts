import { z } from 'zod';

const createSubject = z.object({
  body: z.object({
    name: z.string({ error: 'Name is required' }).min(1, 'Name is required'),
    code: z.string().optional(),
    credit: z.string().optional(),
    teacherId: z.string().optional(),
    description: z.string().optional(),
    roomNumber: z.string().optional(),
  }),
});

const updateSubject = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    code: z.string().optional(),
    credit: z.string().optional(),
    teacherId: z.string().optional(),
    description: z.string().optional(),
    roomNumber: z.string().optional(),
    isDeleted: z.boolean().optional(),
  }),
});

export const SubjectValidations = {
  createSubject,
  updateSubject,
};
