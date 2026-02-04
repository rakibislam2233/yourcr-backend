import { z } from 'zod';

const createAssessmentSubmission = z.object({
  body: z.object({
    assessmentId: z.string({ error: 'Assessment ID is required' }),
    content: z.string().optional(),
    fileUrls: z.array(z.string().url('Invalid file url')).optional(),
  }),
});

const updateAssessmentSubmission = z.object({
  body: z.object({
    content: z.string().optional(),
    fileUrls: z.array(z.string().url('Invalid file url')).optional(),
  }),
});

export const AssessmentSubmissionValidations = {
  createAssessmentSubmission,
  updateAssessmentSubmission,
};
