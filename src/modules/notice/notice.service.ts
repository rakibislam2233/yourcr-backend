import { Request } from 'express';
import { StatusCodes } from 'http-status-codes';
import { addNotificationJob } from '../../queues/notification.queue';
import { AuditAction } from '../../shared/enum/audit.enum';
import { UserRole } from '../../shared/enum/user.enum';
import { IDecodedToken } from '../../shared/interfaces/jwt.interface';
import ApiError from '../../utils/ApiError';
import { createAuditLog } from '../../utils/audit.helper';
import { UserRepository } from '../user/user.repository';
import { ICreateNoticePayload, IUpdateNoticePayload } from './notice.interface';
import { NoticeRepository } from './notice.repository';

const createNotice = async (payload: ICreateNoticePayload, actor: IDecodedToken, req?: Request) => {
  const actorId = actor.userId;
  await createAuditLog(actorId, AuditAction.CREATE_NOTICE, 'Notice', undefined, { payload }, req);

  const notice = await NoticeRepository.createNotice({
    ...payload,
    postedById: actorId,
    batchId: actor.role === UserRole.CR ? actor.batchId || undefined : payload.batchId,
  });

  const noticeCreator = await UserRepository.getUserById(actorId);
  if (!noticeCreator) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  // If CR posts, notify all students in same institution
  if (noticeCreator.role === UserRole.CR) {
    await addNotificationJob({
      title: notice.title,
      message: notice.content,
      type: 'NOTICE',
      relatedId: notice.id,
      crId: noticeCreator.id,
    });
  }

  return notice;
};

const getNoticeById = async (id: string) => {
  const notice = await NoticeRepository.getNoticeById(id);
  if (!notice) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Notice not found');
  }
  await NoticeRepository.incrementNoticeViews(id);
  return notice;
};

const getAllNotices = async (query: any, user: IDecodedToken) => {
  if (user.role === UserRole.CR || user.role === UserRole.STUDENT) {
    query.batchId = user.batchId;
  }
  return await NoticeRepository.getAllNotices(query);
};

const updateNotice = async (
  id: string,
  payload: IUpdateNoticePayload,
  actorId: string,
  req?: Request
) => {
  await createAuditLog(actorId, AuditAction.UPDATE_NOTICE, 'Notice', id, { payload }, req);

  const existing = await NoticeRepository.getNoticeById(id);
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Notice not found');
  }
  return await NoticeRepository.updateNotice(id, payload);
};

const deleteNotice = async (id: string, actorId: string, req?: Request) => {
  await createAuditLog(actorId, AuditAction.DELETE_NOTICE, 'Notice', id, {}, req);

  const existing = await NoticeRepository.getNoticeById(id);
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Notice not found');
  }
  return await NoticeRepository.deleteNotice(id);
};

export const NoticeService = {
  createNotice,
  getNoticeById,
  getAllNotices,
  updateNotice,
  deleteNotice,
};
