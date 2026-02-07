import { Request } from 'express';
import { StatusCodes } from 'http-status-codes';
import { scheduleAssessmentStatusUpdate } from '../../queues/assessmentStatus.queue';
import { addNotificationJob } from '../../queues/notification.queue';
import { scheduleAssessmentReminder } from '../../queues/reminder.queue';
import { AuditAction } from '../../shared/enum/audit.enum';
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

  let subjectName = 'General';
  if (payload.subjectId) {
    const subject = await SubjectRepository.getSubjectById(payload.subjectId);
    if (!subject) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Subject not found');
    }
    subjectName = subject.name;
  }

  const assessment = await AssessmentRepository.createAssessment(payload);

  // Immediate notification to students
  await addNotificationJob({
    title: `New Assessment: ${assessment.title} [${subjectName}]`,
    message: `A new assessment for **${subjectName}** has been posted.\n\nTitle: ${assessment.title}\nDeadline: ${new Date(assessment.deadline).toLocaleString()}\n\nPlease check your dashboard for details.`,
    type: 'ASSESSMENT',
    relatedId: assessment.id,
    crId: actorId,
  });

  // Schedule reminder 1 day before deadline
  await scheduleAssessmentReminder(
    assessment.id,
    new Date(assessment.deadline),
    assessment.title,
    actorId
  );

  // Schedule automatic status updates (SCHEDULED -> ACTIVE -> COMPLETED)
  const startTime = new Date(assessment.date);
  const deadline = new Date(assessment.deadline);
  await scheduleAssessmentStatusUpdate(assessment.id, startTime, deadline);

  return assessment;
};

const getAssessmentById = async (id: string) => {
  const assessment = await AssessmentRepository.getAssessmentById(id);
  if (!assessment || (assessment as any).isDeleted) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Assessment not found');
  }
  return assessment;
};

const getAllAssessments = async (filters: any, options: any) => {
  return await AssessmentRepository.getAllAssessments(filters, options);
};

const updateAssessment = async (id: string, payload: IUpdateAssessmentPayload) => {
  const existingAssessment = await AssessmentService.getAssessmentById(id);

  if (payload.subjectId) {
    const subject = await SubjectRepository.getSubjectById(payload.subjectId);
    if (!subject) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Subject not found');
    }
  }

  const updatedAssessment = await AssessmentRepository.updateAssessment(id, payload);

  // Notify students about the update
  const changes: string[] = [];
  if (payload.title) changes.push('title');
  if (payload.deadline) changes.push('deadline');
  if (payload.description) changes.push('description');

  if (changes.length > 0) {
    await addNotificationJob({
      title: `Assessment Updated: ${updatedAssessment.title}`,
      message: `Assessment details have been updated (${changes.join(', ')}). Please check the latest information.`,
      type: 'ASSESSMENT',
      relatedId: id,
      crId: (existingAssessment as any).createdById,
    });

    // Reschedule reminder if deadline changed
    if (payload.deadline) {
      await scheduleAssessmentReminder(
        updatedAssessment.id,
        new Date(updatedAssessment.deadline),
        updatedAssessment.title,
        (updatedAssessment as any).createdById
      );
    }

    // Reschedule status updates if date or deadline changed
    if (payload.date || payload.deadline) {
      await scheduleAssessmentStatusUpdate(
        updatedAssessment.id,
        new Date(updatedAssessment.date),
        new Date(updatedAssessment.deadline)
      );
    }
  }

  return updatedAssessment;
};

const deleteAssessment = async (id: string) => {
  await AssessmentService.getAssessmentById(id);
  return await AssessmentRepository.deleteAssessment(id);
};

export const AssessmentService = {
  createAssessment,
  getAssessmentById,
  getAllAssessments,
  updateAssessment,
  deleteAssessment,
};
