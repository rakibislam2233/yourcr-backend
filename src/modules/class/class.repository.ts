import { StatusCodes } from 'http-status-codes';
import { database } from '../../config/database.config';
import ApiError from '../../utils/ApiError';
import {
  createPaginationQuery,
  createPaginationResult,
  PaginationResult,
  parsePaginationOptions,
} from '../../utils/pagination.utils';
import parseAmPmToDate from '../../utils/time';
import { ICreateClassPayload, IUpdateClassPayload } from './class.interface';

const createClass = async (payload: ICreateClassPayload) => {
  const baseDate = new Date(payload.classDate);


  if (isNaN(baseDate.getTime())) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid classDate format');
  }

  const startDateTime = parseAmPmToDate(payload.startTime, baseDate);
  const endDateTime = parseAmPmToDate(payload.endTime, baseDate);

  if (endDateTime <= startDateTime) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'End time must be after start time');
  }

  return await database.class.create({
    data: {
      ...payload,
      classDate: baseDate,
      startTime: startDateTime,
      endTime: endDateTime,
    },
    include: {
      subject: true,
    },
  });
};

const getClassById = async (id: string) => {
  return await database.class.findUnique({
    where: { id },
    include: {
      subject: true,
      teacher: true,
    },
  });
};

const getAllClasses = async (filters: any, options: any): Promise<PaginationResult<any>> => {
  const pagination = parsePaginationOptions(options);
  const { skip, take, orderBy } = createPaginationQuery(pagination);

  const where: any = { isDeleted: false };
  if (filters.subjectId) {
    where.subjectId = filters.subjectId;
  }
  if (filters.teacherId) {
    where.teacherId = filters.teacherId;
  }
  if (filters.status) {
    where.status = filters.status;
  }
  if (filters.classType) {
    where.classType = filters.classType;
  }
  if (filters.classDate) {
    where.classDate = new Date(filters.classDate);
  }
  if (filters.batchId) {
    where.batchId = filters.batchId;
  }

  const [classes, total] = await Promise.all([
    database.class.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        subject: true,
        teacher: true,
      },
    }),
    database.class.count({ where }),
  ]);

  return createPaginationResult(classes, total, pagination);
};

const updateClass = async (id: string, payload: IUpdateClassPayload) => {
  let baseDate: Date | undefined;
  let startDateTime: Date | undefined;
  let endDateTime: Date | undefined;

  if (payload.classDate) {
    baseDate = new Date(payload.classDate);

    if (isNaN(baseDate.getTime())) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid classDate format');
    }
  }

  if (payload.startTime && baseDate) {
    startDateTime = parseAmPmToDate(payload.startTime, baseDate);
  }

  if (payload.endTime && baseDate) {
    endDateTime = parseAmPmToDate(payload.endTime, baseDate);
  }

  if (startDateTime && endDateTime && endDateTime <= startDateTime) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'End time must be after start time');
  }

  // Build update data object - only include fields that are being updated
  const updateData: any = { ...payload };

  // Only update date/time fields if they were provided and processed
  if (payload.classDate && baseDate) {
    updateData.classDate = baseDate;
  } else {
    delete updateData.classDate;
  }

  if (payload.startTime && startDateTime) {
    updateData.startTime = startDateTime;
  } else {
    delete updateData.startTime;
  }

  if (payload.endTime && endDateTime) {
    updateData.endTime = endDateTime;
  } else {
    delete updateData.endTime;
  }

  return await database.class.update({
    where: { id, isDeleted: false },
    data: updateData,
  });
};

const deleteClass = async (id: string) => {
  return await database.class.update({
    where: { id },
    data: { isDeleted: true },
  });
};

export const ClassRepository = {
  createClass,
  getClassById,
  getAllClasses,
  updateClass,
  deleteClass,
};
