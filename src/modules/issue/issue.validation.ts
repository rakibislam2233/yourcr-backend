import { z } from 'zod';

const createIssue = z.object({
  body: z.object({
    title: z.string({ error: 'Title is required' }).min(1, 'Title is required'),
    description: z.string({ error: 'Description is required' }).min(1, 'Description is required'),
    type: z.enum(['ACADEMIC', 'TECHNICAL', 'ADMINISTRATIVE', 'OTHER']),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
    fileUrl: z.string().url('Invalid file url').optional(),
  }),
});

const updateIssue = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    type: z.enum(['ACADEMIC', 'TECHNICAL', 'ADMINISTRATIVE', 'OTHER']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    status: z.enum(['NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
    fileUrl: z.string().url('Invalid file url').optional(),
    resolution: z.string().optional(),
  }),
});

export const IssueValidations = {
  createIssue,
  updateIssue,
};
