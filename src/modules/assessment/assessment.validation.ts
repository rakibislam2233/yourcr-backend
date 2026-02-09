import { z } from 'zod';
import { parseDateInBD, getBangladeshTime } from '../../utils/time';

const createAssessment = z.object({
  body: z
    .object({
      subjectId: z.string('Subject is required'),
      title: z.string({ message: 'Title is required' }).min(1, 'Title is required'),
      type: z.enum(['EXAM', 'ASSIGNMENT', 'QUIZ', 'PROJECT']),
      description: z.string().optional(),
      fileUrls: z.array(z.string().url('Invalid file url')).optional(),
      totalMarks: z.string().optional(),

      date: z.string({ message: 'Date is required' }).refine(
        val => {
          try {
            const date = parseDateInBD(val);
            return !isNaN(date.getTime());
          } catch {
            return false;
          }
        },
        {
          message: 'Invalid date format (use YYYY-MM-DD or ISO format)',
        }
      ),

      deadline: z.string({ message: 'Deadline is required' }).refine(
        val => {
          try {
            const date = parseDateInBD(val);
            return !isNaN(date.getTime());
          } catch {
            return false;
          }
        },
        {
          message: 'Invalid deadline format (use YYYY-MM-DD or ISO format)',
        }
      ),
    })
    .refine(
      data => {
        try {
          const start = parseDateInBD(data.date);
          const deadline = parseDateInBD(data.deadline);

          return deadline > start;
        } catch {
          return false;
        }
      },
      {
        message: 'Deadline must be after the start date',
        path: ['deadline'],
      }
    )
    .refine(
      data => {
        try {
          const assessmentDate = parseDateInBD(data.date);
          const now = getBangladeshTime();

          // Allow up to 30 minutes before assessment start
          const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

          return assessmentDate >= thirtyMinutesAgo;
        } catch {
          return false;
        }
      },
      {
        message: 'Assessment can only be created up to 30 minutes before the start time',
        path: ['date'],
      }
    ),
});

const updateAssessment = z.object({
  body: z
    .object({
      subjectId: z.string().optional(),
      title: z.string().min(1).optional(),
      type: z.enum(['EXAM', 'ASSIGNMENT', 'QUIZ', 'PROJECT']).optional(),
      description: z.string().optional(),
      fileUrls: z.array(z.string().url('Invalid file url')).optional(),
      totalMarks: z.number().optional(),

      date: z
        .string()
        .optional()
        .refine(
          val => {
            if (!val) return true;
            try {
              const date = parseDateInBD(val);
              return !isNaN(date.getTime());
            } catch {
              return false;
            }
          },
          {
            message: 'Invalid date format',
          }
        ),

      deadline: z
        .string()
        .optional()
        .refine(
          val => {
            if (!val) return true;
            try {
              const date = parseDateInBD(val);
              return !isNaN(date.getTime());
            } catch {
              return false;
            }
          },
          {
            message: 'Invalid deadline format',
          }
        ),
    })
    .refine(
      data => {
        if (!data.date || !data.deadline) return true;

        try {
          const start = parseDateInBD(data.date);
          const deadline = parseDateInBD(data.deadline);

          return deadline > start;
        } catch {
          return false;
        }
      },
      {
        message: 'Deadline must be after the start date',
        path: ['deadline'],
      }
    ),
});

export const AssessmentValidations = {
  createAssessment,
  updateAssessment,
};
