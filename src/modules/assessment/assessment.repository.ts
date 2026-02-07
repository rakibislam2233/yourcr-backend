import { database } from '../../config/database.config';
import {
  createPaginationQuery,
  createPaginationResult,
  PaginationResult,
  parsePaginationOptions,
} from '../../utils/pagination.utils';
import { ICreateAssessmentPayload, IUpdateAssessmentPayload } from './assessment.interface';

const createAssessment = async (payload: ICreateAssessmentPayload) => {
  return await database.assessment.create({
    data: {
      ...payload,
      date: new Date(payload.date),
      deadline: new Date(payload.deadline),
    },
  });
};

const getAssessmentById = async (id: string) => {
  return await database.assessment.findUnique({
    where: { id },
    include: {
      subject: true,
      createdBy: true,
    },
  });
};

const getAllAssessments = async (query: any): Promise<PaginationResult<any>> => {
  const pagination = parsePaginationOptions(query);
  const { skip, take, orderBy } = createPaginationQuery(pagination);

  const where: any = {};
  if (query.subjectId) {
    where.subjectId = query.subjectId;
  }
  if (query.type) {
    where.type = query.type;
  }
  if (query.createdById) {
    where.createdById = query.createdById;
  }
  if (query.batchId) {
    where.batchId = query.batchId;
  }

  const [assessments, total] = await Promise.all([
    database.assessment.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        subject: true,
        createdBy: true,
      },
    }),
    database.assessment.count({ where }),
  ]);

  return createPaginationResult(assessments, total, pagination);
};

const updateAssessment = async (id: string, payload: IUpdateAssessmentPayload) => {
  return await database.assessment.update({
    where: { id },
    data: {
      ...payload,
      date: payload.date ? new Date(payload.date) : undefined,
      deadline: payload.deadline ? new Date(payload.deadline) : undefined,
    },
  });
};

const deleteAssessment = async (id: string) => {
  return await database.assessment.delete({
    where: { id },
  });
};

export const AssessmentRepository = {
  createAssessment,
  getAssessmentById,
  getAllAssessments,
  updateAssessment,
  deleteAssessment,
};
