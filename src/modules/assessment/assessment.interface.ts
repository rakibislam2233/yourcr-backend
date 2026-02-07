export type AssessmentType = 'EXAM' | 'ASSIGNMENT' | 'QUIZ' | 'PROJECT';

export interface ICreateAssessmentPayload {
  subjectId?: string;
  title: string;
  type: AssessmentType;
  description?: string;
  fileUrls?: string[];
  totalMarks?: number;
  date: string;
  deadline: string;
  createdById: string;
  batchId: string;
}

export interface IUpdateAssessmentPayload {
  subjectId?: string;
  title?: string;
  type?: AssessmentType;
  description?: string;
  fileUrls?: string[];
  totalMarks?: number;
  date?: string;
  deadline?: string;
  createdById?: string;
  batchId?: string;
}
