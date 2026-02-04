import { StatusCodes } from 'http-status-codes';
import ApiError from '../../utils/ApiError';
import { ICreateNoticePayload, IUpdateNoticePayload } from './notice.interface';
import { NoticeRepository } from './notice.repository';
import { UserRepository } from '../user/user.repository';
import { addNotificationJob } from '../../queues/notification.queue';
import { UserRole } from '../../shared/enum/user.enum';

const createNotice = async (payload: ICreateNoticePayload, actorId: string) => {
  const notice = await NoticeRepository.createNotice({
    ...payload,
    postedById: actorId,
  });

  const actor = await UserRepository.getUserById(actorId);
  if (!actor) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  // If CR posts, notify all students in same institution
  if (actor.role === UserRole.CR && actor.institutionId) {
    await addNotificationJob({
      title: notice.title,
      message: notice.content,
      type: 'NOTICE',
      relatedId: notice.id,
      institutionId: actor.institutionId,
      targetRole: UserRole.STUDENT,
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

const getAllNotices = async (query: any) => {
  return await NoticeRepository.getAllNotices(query);
};

const updateNotice = async (id: string, payload: IUpdateNoticePayload) => {
  const existing = await NoticeRepository.getNoticeById(id);
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Notice not found');
  }
  return await NoticeRepository.updateNotice(id, payload);
};

const deleteNotice = async (id: string) => {
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
