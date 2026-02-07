import { database } from '../../config/database.config';
import {
  createPaginationQuery,
  createPaginationResult,
  PaginationResult,
  parsePaginationOptions,
} from '../../utils/pagination.utils';
import {
  ICreateAssessmentSubmissionPayload,
  IUpdateAssessmentSubmissionPayload,
} from './assessmentSubmission.interface';

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

const getAllSubmissions = async (filters: any, options: any): Promise<PaginationResult<any>> => {
  const pagination = parsePaginationOptions(options);
  const { skip, take, orderBy } = createPaginationQuery(pagination);

  const where: any = { isDeleted: false };
  if (filters.assessmentId) {
    where.assessmentId = filters.assessmentId;
  }
  if (filters.studentId) {
    where.studentId = filters.studentId;
  }
  if (filters.batchId) {
    where.batchId = filters.batchId;
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

const deleteSubmission = async (id: string) => {
  return await database.assessmentSubmission.update({
    where: { id },
    data: { isDeleted: true },
  });
};

export const AssessmentSubmissionRepository = {
  createAssessmentSubmission,
  getSubmissionById,
  getSubmissionByAssessmentAndStudent,
  getAllSubmissions,
  updateSubmission,
  deleteSubmission,
};
