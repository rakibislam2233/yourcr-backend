import { StatusCodes } from 'http-status-codes';
import { database } from '../../config/database.config';
import ApiError from '../../utils/ApiError';
import { ICreateSession } from './session.interface';

const createSession = async (crId: string, institutionId: string, payload: ICreateSession) => {
  //check if session already exists
  const session = await database.session.findFirst({
    where: {
      crId,
      name: payload.name,
      sessionType: payload.sessionType,
      department: payload.department,
      academicYear: payload.academicYear,
    },
  });
  if (session) {
    throw new ApiError(StatusCodes.CONFLICT, 'Session already exists');
  }

  const result = await database.session.create({
    data: {
      institutionId,
      name: payload.name,
      sessionType: payload.sessionType,
      department: payload.department,
      academicYear: payload.academicYear,
      crId,
    },
  });

  return result;
};

export const SessionRepository = { createSession };
