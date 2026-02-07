import { database } from '../../config/database.config';
import {
  createPaginationQuery,
  createPaginationResult,
  PaginationResult,
  parsePaginationOptions,
} from '../../utils/pagination.utils';
import { ICreateNoticePayload, IUpdateNoticePayload } from './notice.interface';

const createNotice = async (payload: ICreateNoticePayload) => {
  return await database.notice.create({
    data: payload,
  });
};

const getNoticeById = async (id: string) => {
  return await database.notice.findUnique({
    where: { id },
    include: {
      postedBy: true,
    },
  });
};

const getAllNotices = async (filters: any, options: any): Promise<PaginationResult<any>> => {
  const pagination = parsePaginationOptions(options);
  const { skip, take, orderBy } = createPaginationQuery(pagination);

  const where: any = { isDeleted: false };
  if (filters.type) {
    where.type = filters.type;
  }
  if (filters.isActive !== undefined) {
    where.isActive = filters.isActive === 'true' || filters.isActive === true;
  }
  if (filters.postedById) {
    where.postedById = filters.postedById;
  }
  if (filters.batchId) {
    where.batchId = filters.batchId;
  }
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { content: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const [notices, total] = await Promise.all([
    database.notice.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        postedBy: true,
      },
    }),
    database.notice.count({ where }),
  ]);

  return createPaginationResult(notices, total, pagination);
};

const updateNotice = async (id: string, payload: IUpdateNoticePayload) => {
  return await database.notice.update({
    where: { id },
    data: payload,
  });
};

const deleteNotice = async (id: string) => {
  return await database.notice.update({
    where: { id },
    data: { isDeleted: true },
  });
};

const incrementNoticeViews = async (id: string) => {
  return await database.notice.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  });
};

export const NoticeRepository = {
  createNotice,
  getNoticeById,
  getAllNotices,
  updateNotice,
  deleteNotice,
  incrementNoticeViews,
};
