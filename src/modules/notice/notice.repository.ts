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

const getAllNotices = async (query: any): Promise<PaginationResult<any>> => {
  const pagination = parsePaginationOptions(query);
  const { skip, take, orderBy } = createPaginationQuery(pagination);

  const where: any = {};
  if (query.type) {
    where.type = query.type;
  }
  if (query.isActive !== undefined) {
    where.isActive = query.isActive === 'true' || query.isActive === true;
  }
  if (query.postedById) {
    where.postedById = query.postedById;
  }
  if (query.batchId) {
    where.batchId = query.batchId;
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
  return await database.notice.delete({
    where: { id },
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
