export interface ICreateAssessmentSubmissionPayload {
  assessmentId: string;
  studentId?: string;
  content?: string;
  fileUrls?: string[];
}

export interface IUpdateAssessmentSubmissionPayload {
  content?: string;
  fileUrls?: string[];
}
