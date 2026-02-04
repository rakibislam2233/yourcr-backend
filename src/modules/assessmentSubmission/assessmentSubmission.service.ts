import { StatusCodes } from 'http-status-codes';
import ApiError from '../../utils/ApiError';
import { ICreateAssessmentSubmissionPayload, IUpdateAssessmentSubmissionPayload } from './assessmentSubmission.interface';
import { AssessmentSubmissionRepository } from './assessmentSubmission.repository';
import { AssessmentRepository } from '../assessment/assessment.repository';
import { UserRepository } from '../user/user.repository';
import { createAuditLog } from '../../utils/audit.helper';
import { AuditAction } from '../../shared/enum/audit.enum';
import { Request } from 'express';

const submitAssessment = async (payload: ICreateAssessmentSubmissionPayload, studentId: string, req?: Request) => {
  const assessment = await AssessmentRepository.getAssessmentById(payload.assessmentId);
  if (!assessment) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Assessment not found');
  }

  const student = await UserRepository.getUserById(studentId);
  if (!student || student.role !== 'STUDENT') {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Only students can submit assessments');
  }

  const existing = await AssessmentSubmissionRepository.getSubmissionByAssessmentAndStudent(
    payload.assessmentId,
    studentId
  );
  if (existing) {
    throw new ApiError(StatusCodes.CONFLICT, 'Already submitted');
  }

  await createAuditLog(studentId, AuditAction.SUBMIT_ASSESSMENT, 'AssessmentSubmission', undefined, { payload }, req);

  return await AssessmentSubmissionRepository.createAssessmentSubmission({
    ...payload,
    studentId,
  });
};

const getSubmissionById = async (id: string) => {
  const submission = await AssessmentSubmissionRepository.getSubmissionById(id);
  if (!submission) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Submission not found');
  }
  return submission;
};

const getMySubmissions = async (studentId: string, query: any) => {
  return await AssessmentSubmissionRepository.getAllSubmissions({ ...query, studentId });
};

const updateSubmission = async (id: string, payload: IUpdateAssessmentSubmissionPayload, studentId: string) => {
  const existing = await AssessmentSubmissionRepository.getSubmissionById(id);
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Submission not found');
  }
  if (existing.studentId !== studentId) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'You can only update your own submission');
  }
  return await AssessmentSubmissionRepository.updateSubmission(id, payload);
};

export const AssessmentSubmissionService = {
  submitAssessment,
  getSubmissionById,
  getMySubmissions,
  updateSubmission,
};
