import { Request, Response } from 'express';
import httpStatus from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { NotificationService } from './notification.service';

const getMyNotifications = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const result = await NotificationService.getMyNotifications(userId, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Notifications fetched successfully',
    data: result.data,
    meta: result.pagination,
  });
});

const markNotificationRead = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const notificationId = Array.isArray(id) ? id[0] : id;
  const result = await NotificationService.updateNotification(notificationId, { isRead: true });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Notification marked as read',
    data: result,
  });
});

const deleteNotification = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const notificationId = Array.isArray(id) ? id[0] : id;
  await NotificationService.deleteNotification(notificationId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Notification deleted successfully',
  });
});

export const NotificationController = {
  getMyNotifications,
  markNotificationRead,
  deleteNotification,
};
