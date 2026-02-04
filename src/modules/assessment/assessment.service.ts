import { StatusCodes } from 'http-status-codes';
import ApiError from '../../utils/ApiError';
import { ICreateAssessmentPayload, IUpdateAssessmentPayload } from './assessment.interface';
import { AssessmentRepository } from './assessment.repository';
import { SubjectRepository } from '../subject/subject.repository';

const createAssessment = async (payload: ICreateAssessmentPayload) => {
  if (payload.subjectId) {
    const subject = await SubjectRepository.getSubjectById(payload.subjectId);
    if (!subject) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Subject not found');
    }
  }
  return await AssessmentRepository.createAssessment(payload);
};

const getAssessmentById = async (id: string) => {
  const assessment = await AssessmentRepository.getAssessmentById(id);
  if (!assessment) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Assessment not found');
  }
  return assessment;
};

const getAllAssessments = async (query: any) => {
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
