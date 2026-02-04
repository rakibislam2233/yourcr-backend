import { database } from '../../config/database.config';
import { ICreateNotificationPayload, IUpdateNotificationPayload } from './notification.interface';
import {
  createPaginationResult,
  PaginationResult,
  parsePaginationOptions,
  createPaginationQuery,
} from '../../utils/pagination.utils';

const createNotification = async (payload: ICreateNotificationPayload) => {
  return await database.notification.create({
    data: payload,
  });
};

const getNotificationById = async (id: string) => {
  return await database.notification.findUnique({
    where: { id },
  });
};

const getNotificationsByUser = async (userId: string, query: any): Promise<PaginationResult<any>> => {
  const pagination = parsePaginationOptions(query);
  const { skip, take, orderBy } = createPaginationQuery(pagination);

  const where: any = { userId };
  if (query.isRead !== undefined) {
    where.isRead = query.isRead === 'true' || query.isRead === true;
  }
  if (query.type) {
    where.type = query.type;
  }

  const [notifications, total] = await Promise.all([
    database.notification.findMany({
      where,
      skip,
      take,
      orderBy,
    }),
    database.notification.count({ where }),
  ]);

  return createPaginationResult(notifications, total, pagination);
};

const updateNotification = async (id: string, payload: IUpdateNotificationPayload) => {
  return await database.notification.update({
    where: { id },
    data: payload,
  });
};

const deleteNotification = async (id: string) => {
  return await database.notification.delete({
    where: { id },
  });
};

export const NotificationRepository = {
  createNotification,
  getNotificationById,
  getNotificationsByUser,
  updateNotification,
  deleteNotification,
};
