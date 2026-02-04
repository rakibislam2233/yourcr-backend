import { z } from 'zod';

const createTeacher = z.object({
  body: z.object({
    name: z.string({ error: 'Name is required' }).min(1, 'Name is required'),
    email: z.string().email('Invalid email').optional(),
    phone: z.string().optional(),
    photoUrl: z.string().url('Invalid photo url').optional(),
    designation: z.string().optional(),
    department: z.string().optional(),
  }),
});

const updateTeacher = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    email: z.string().email('Invalid email').optional(),
    phone: z.string().optional(),
    photoUrl: z.string().url('Invalid photo url').optional(),
    designation: z.string().optional(),
    department: z.string().optional(),
  }),
});

export const TeacherValidations = {
  createTeacher,
  updateTeacher,
};
