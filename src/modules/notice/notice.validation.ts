import { z } from 'zod';

const createNotice = z.object({
  body: z.object({
    title: z.string({ error: 'Title is required' }).min(1, 'Title is required'),
    fileUrl: z.string().url('Invalid file url').optional(),
    content: z.string({ error: 'Content is required' }).min(1, 'Content is required'),
    type: z.enum(['GENERAL', 'URGENT', 'EVENT', 'EXAM', 'HOLIDAY']),
    isActive: z.boolean().optional(),
  }),
});

const updateNotice = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    fileUrl: z.string().url('Invalid file url').optional(),
    content: z.string().min(1).optional(),
    type: z.enum(['GENERAL', 'URGENT', 'EVENT', 'EXAM', 'HOLIDAY']).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const NoticeValidations = {
  createNotice,
  updateNotice,
};
