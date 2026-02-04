import { StatusCodes } from 'http-status-codes';
import ApiError from '../../utils/ApiError';
import { ICreateNotificationPayload, IUpdateNotificationPayload } from './notification.interface';
import { NotificationRepository } from './notification.repository';

const createNotification = async (payload: ICreateNotificationPayload) => {
  return await NotificationRepository.createNotification(payload);
};

const getNotificationById = async (id: string) => {
  const notification = await NotificationRepository.getNotificationById(id);
  if (!notification) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Notification not found');
  }
  return notification;
};

const getMyNotifications = async (userId: string, query: any) => {
  return await NotificationRepository.getNotificationsByUser(userId, query);
};

const updateNotification = async (id: string, payload: IUpdateNotificationPayload) => {
  const existing = await NotificationRepository.getNotificationById(id);
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Notification not found');
  }
  return await NotificationRepository.updateNotification(id, payload);
};

const deleteNotification = async (id: string) => {
  const existing = await NotificationRepository.getNotificationById(id);
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Notification not found');
  }
  return await NotificationRepository.deleteNotification(id);
};

export const NotificationService = {
  createNotification,
  getNotificationById,
  getMyNotifications,
  updateNotification,
  deleteNotification,
};
