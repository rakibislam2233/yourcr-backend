import { database } from '../../config/database.config';
import { ICreateAssessmentSubmissionPayload, IUpdateAssessmentSubmissionPayload } from './assessmentSubmission.interface';
import {
  createPaginationResult,
  PaginationResult,
  parsePaginationOptions,
  createPaginationQuery,
} from '../../utils/pagination.utils';

const createAssessmentSubmission = async (payload: ICreateAssessmentSubmissionPayload) => {
  return await database.assessmentSubmission.create({
    data: payload,
  });
};

const getSubmissionById = async (id: string) => {
  return await database.assessmentSubmission.findUnique({
    where: { id },
    include: {
      assessment: true,
      student: true,
    },
  });
};

const getSubmissionByAssessmentAndStudent = async (assessmentId: string, studentId: string) => {
  return await database.assessmentSubmission.findUnique({
    where: {
      assessmentId_studentId: {
        assessmentId,
        studentId,
      },
    },
    include: {
      assessment: true,
      student: true,
    },
  });
};

const getAllSubmissions = async (query: any): Promise<PaginationResult<any>> => {
  const pagination = parsePaginationOptions(query);
  const { skip, take, orderBy } = createPaginationQuery(pagination);

  const where: any = {};
  if (query.assessmentId) {
    where.assessmentId = query.assessmentId;
  }
  if (query.studentId) {
    where.studentId = query.studentId;
  }

  const [submissions, total] = await Promise.all([
    database.assessmentSubmission.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        assessment: true,
        student: true,
      },
    }),
    database.assessmentSubmission.count({ where }),
  ]);

  return createPaginationResult(submissions, total, pagination);
};

const updateSubmission = async (id: string, payload: IUpdateAssessmentSubmissionPayload) => {
  return await database.assessmentSubmission.update({
    where: { id },
    data: payload,
  });
};

export const AssessmentSubmissionRepository = {
  createAssessmentSubmission,
  getSubmissionById,
  getSubmissionByAssessmentAndStudent,
  getAllSubmissions,
  updateSubmission,
};
