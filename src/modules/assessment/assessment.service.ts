import { Request } from 'express';
import { StatusCodes } from 'http-status-codes';
import { scheduleAssessmentStatusUpdate } from '../../queues/assessmentStatus.queue';
import { addNotificationJob } from '../../queues/notification.queue';
import { scheduleAssessmentReminder } from '../../queues/reminder.queue';
import { AuditAction } from '../../shared/enum/audit.enum';
import { IDecodedToken } from '../../shared/interfaces/jwt.interface';
import ApiError from '../../utils/ApiError';
import { createAuditLog } from '../../utils/audit.helper';
import { getBangladeshTime, parseDateInBD } from '../../utils/time';
import { SubjectRepository } from '../subject/subject.repository';
import { ICreateAssessmentPayload, IUpdateAssessmentPayload } from './assessment.interface';
import { AssessmentRepository } from './assessment.repository';

const createAssessment = async (
  payload: ICreateAssessmentPayload,
  actor: IDecodedToken,
  req?: Request
) => {
  const actorId = actor.userId;

  // ✅ Parse dates in Bangladesh timezone
  const assessmentDate = parseDateInBD(payload.date);
  const deadline = parseDateInBD(payload.deadline);
  const now = getBangladeshTime();

  // ✅ Allow creating assessment up to 30 minutes before start
  const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

  if (assessmentDate < thirtyMinutesAgo) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Assessment can only be created up to 30 minutes before the start time'
    );
  }

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

  const assessment = await AssessmentRepository.createAssessment({
    ...payload,
    date: assessmentDate,
    deadline: deadline,
  });

  // Immediate notification
  await addNotificationJob({
    title: `New Assessment: ${assessment.title} [${subjectName}]`,
    message: `A new assessment for **${subjectName}** has been posted.\n\nTitle: ${assessment.title}\nDeadline: ${deadline.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' })}\n\nPlease check your dashboard for details.`,
    type: 'ASSESSMENT',
    relatedId: assessment.id,
    crId: actorId,
  });

  // Schedule reminders
  await scheduleAssessmentReminder(assessment.id, deadline, assessment.title, actorId);

  // Schedule status updates
  await scheduleAssessmentStatusUpdate(assessment.id, assessmentDate, deadline);

  return assessment;
};

const updateAssessment = async (id: string, payload: IUpdateAssessmentPayload) => {
  const existingAssessment = await AssessmentService.getAssessmentById(id);

  // ✅ Validate date if being updated
  if (payload.date) {
    const assessmentDate = parseDateInBD(payload.date);
    const now = getBangladeshTime();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

    if (assessmentDate < thirtyMinutesAgo) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Assessment can only be updated up to 30 minutes before the start time'
      );
    }
  }

  if (payload.subjectId) {
    const subject = await SubjectRepository.getSubjectById(payload.subjectId);
    if (!subject) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Subject not found');
    }
  }

  // ✅ Parse dates
  const updateData: any = { ...payload };
  if (payload.date) {
    updateData.date = parseDateInBD(payload.date);
  }
  if (payload.deadline) {
    updateData.deadline = parseDateInBD(payload.deadline);
  }

  const updatedAssessment = await AssessmentRepository.updateAssessment(id, updateData);

  // Notify about changes
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

    // Reschedule if needed
    if (payload.deadline) {
      await scheduleAssessmentReminder(
        updatedAssessment.id,
        new Date(updatedAssessment.deadline),
        updatedAssessment.title,
        (updatedAssessment as any).createdById
      );
    }

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
