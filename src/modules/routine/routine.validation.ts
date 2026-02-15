import { z } from 'zod';

const createRoutine = z.object({
  body: z.object({
    name: z.string({ error: 'Name is required' }).min(1, 'Name is required'),
    fileUrl: z.string({ error: 'fileUrl is required' }).url('Invalid file url').optional(),
    type: z.enum(['CLASS', 'EXAM']),
  }),
});

const updateRoutine = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    fileUrl: z.string().url('Invalid file url').optional(),
    type: z.enum(['CLASS', 'EXAM']).optional(),
  }),
});

export const RoutineValidations = {
  createRoutine,
  updateRoutine,
};
