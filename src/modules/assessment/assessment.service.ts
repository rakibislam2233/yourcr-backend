import { Request } from 'express';
import { StatusCodes } from 'http-status-codes';
import { addNotificationJob } from '../../queues/notification.queue';
import { AuditAction } from '../../shared/enum/audit.enum';
import { UserRole } from '../../shared/enum/user.enum';
import { IDecodedToken } from '../../shared/interfaces/jwt.interface';
import ApiError from '../../utils/ApiError';
import { createAuditLog } from '../../utils/audit.helper';
import { SubjectRepository } from '../subject/subject.repository';
import { ICreateAssessmentPayload, IUpdateAssessmentPayload } from './assessment.interface';
import { AssessmentRepository } from './assessment.repository';

const createAssessment = async (
  payload: ICreateAssessmentPayload,
  actor: IDecodedToken,
  req?: Request
) => {
  const actorId = actor.userId;
  await createAuditLog(
    actorId,
    AuditAction.CREATE_ASSESSMENT,
    'Assessment',
    undefined,
    { payload },
    req
  );

  // Enforce batch isolation for CR
  if (actor.role === UserRole.CR) {
    payload.batchId = actor.batchId || undefined;
  }

  if (payload.subjectId) {
    const subject = await SubjectRepository.getSubjectById(payload.subjectId);
    if (!subject) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Subject not found');
    }
  }

  const assessment = await AssessmentRepository.createAssessment(payload);

  // Notify students under this CR
  await addNotificationJob({
    title: `New Assessment: ${assessment.title}`,
    message: `Deadline: ${new Date(assessment.deadline).toLocaleString()}`,
    type: 'ASSESSMENT',
    relatedId: assessment.id,
    crId: actorId,
  });

  return assessment;
};

const getAssessmentById = async (id: string) => {
  const assessment = await AssessmentRepository.getAssessmentById(id);
  if (!assessment) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Assessment not found');
  }
  return assessment;
};

const getAllAssessments = async (query: any, user: IDecodedToken) => {
  if (user.role === UserRole.CR || user.role === UserRole.STUDENT) {
    query.batchId = user.batchId;
  }
  return await AssessmentRepository.getAllAssessments(query);
};

const updateAssessment = async (id: string, payload: IUpdateAssessmentPayload) => {
  const existing = await AssessmentRepository.getAssessmentById(id);
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Assessment not found');
  }

  if (payload.subjectId) {
    const subject = await SubjectRepository.getSubjectById(payload.subjectId);
    if (!subject) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Subject not found');
    }
  }

  return await AssessmentRepository.updateAssessment(id, payload);
};

const deleteAssessment = async (id: string) => {
  const existing = await AssessmentRepository.getAssessmentById(id);
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Assessment not found');
  }
  return await AssessmentRepository.deleteAssessment(id);
};

export const AssessmentService = {
  createAssessment,
  getAssessmentById,
  getAllAssessments,
  updateAssessment,
  deleteAssessment,
};
