import { z } from 'zod';

const createAssessment = z.object({
  body: z
    .object({
      subjectId: z.string('Subject is required'),
      title: z.string({ error: 'Title is required' }).min(1, 'Title is required'),
      type: z.enum(['EXAM', 'ASSIGNMENT', 'QUIZ', 'PROJECT']),
      description: z.string().optional(),
      fileUrls: z.array(z.string().url('Invalid file url')).optional(),
      totalMarks: z.string().optional(),
      date: z.string({ error: 'Date is required' }),
      deadline: z.string({ error: 'Deadline is required' }),
    })
    .refine(
      data => {
        const start = new Date(data.date);
        const now = new Date();
        // Allow 5 mins buffer for server lag
        return start.getTime() > now.getTime() - 5 * 60 * 1000;
      },
      {
        message: 'Assessment date cannot be in the past',
        path: ['date'],
      }
    )
    .refine(
      data => {
        const start = new Date(data.date);
        const deadline = new Date(data.deadline);
        return deadline > start;
      },
      {
        message: 'Deadline must be after the start date',
        path: ['deadline'],
      }
    ),
});

const updateAssessment = z.object({
  body: z.object({
    subjectId: z.string().optional(),
    title: z.string().min(1).optional(),
    type: z.enum(['EXAM', 'ASSIGNMENT', 'QUIZ', 'PROJECT']).optional(),
    description: z.string().optional(),
    fileUrls: z.array(z.string().url('Invalid file url')).optional(),
    totalMarks: z.number().optional(),
    date: z.string().optional(),
    deadline: z.string().optional(),
  }),
});

export const AssessmentValidations = {
  createAssessment,
  updateAssessment,
};
