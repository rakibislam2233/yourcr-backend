import { Request, Response } from 'express';
import httpStatus from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { NoticeService } from './notice.service';

const createNotice = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const result = await NoticeService.createNotice(req.body, userId);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Notice created successfully',
    data: result,
  });
});

const getNoticeById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const noticeId = Array.isArray(id) ? id[0] : id;
  const result = await NoticeService.getNoticeById(noticeId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Notice fetched successfully',
    data: result,
  });
});

const getAllNotices = catchAsync(async (req: Request, res: Response) => {
  const result = await NoticeService.getAllNotices(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Notices fetched successfully',
    data: result.data,
    meta: result.pagination,
  });
});

const updateNotice = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const noticeId = Array.isArray(id) ? id[0] : id;
  const result = await NoticeService.updateNotice(noticeId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Notice updated successfully',
    data: result,
  });
});

const deleteNotice = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const noticeId = Array.isArray(id) ? id[0] : id;
  await NoticeService.deleteNotice(noticeId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Notice deleted successfully',
  });
});

export const NoticeController = {
  createNotice,
  getNoticeById,
  getAllNotices,
  updateNotice,
  deleteNotice,
};
