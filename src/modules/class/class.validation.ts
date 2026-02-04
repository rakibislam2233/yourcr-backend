import { z } from 'zod';

const createClass = z.object({
  body: z.object({
    subjectId: z.string().optional(),
    teacherId: z.string().optional(),
    classDate: z.string({ error: 'classDate is required' }),
    startTime: z.string({ error: 'startTime is required' }),
    endTime: z.string({ error: 'endTime is required' }),
    classType: z.enum(['ONLINE', 'OFFLINE']).optional(),
    status: z.enum(['SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED']).optional(),
    roomNumber: z.string().optional(),
    joinLink: z.string().url('Invalid join link').optional(),
  }),
});

const updateClass = z.object({
  body: z.object({
    subjectId: z.string().optional(),
    teacherId: z.string().optional(),
    classDate: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    classType: z.enum(['ONLINE', 'OFFLINE']).optional(),
    status: z.enum(['SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED']).optional(),
    roomNumber: z.string().optional(),
    joinLink: z.string().url('Invalid join link').optional(),
  }),
});

export const ClassValidations = {
  createClass,
  updateClass,
};
