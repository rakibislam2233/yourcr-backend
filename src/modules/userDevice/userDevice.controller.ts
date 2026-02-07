import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { IDecodedToken } from '../../shared/interfaces/jwt.interface';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { UserDeviceService } from './userDevice.service';

/**
 * @route   POST /api/user-devices/register
 * @desc    Register device for push notifications
 * @access  Private
 */
const registerDevice = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IDecodedToken;
  const { deviceType, deviceName, deviceId, fcmToken, webPushToken } = req.body;

  const device = await UserDeviceService.registerDevice({
    userId: user.userId,
    deviceType,
    deviceName,
    deviceId,
    fcmToken,
    webPushToken,
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Device registered successfully for push notifications',
    data: device,
  });
});

/**
 * @route   POST /api/user-devices/unregister
 * @desc    Unregister device from push notifications
 * @access  Private
 */
const unregisterDevice = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IDecodedToken;
  const { deviceId } = req.body;

  await UserDeviceService.unregisterDevice(user.userId, deviceId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Device unregistered successfully',
    data: { deviceId },
  });
});

/**
 * @route   GET /api/user-devices
 * @desc    Get all devices for current user
 * @access  Private
 */
const getMyDevices = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IDecodedToken;
  const activeOnly = req.query.activeOnly === 'true';

  const devices = await UserDeviceService.getUserDevices(user.userId, activeOnly);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Devices retrieved successfully',
    data: devices,
  });
});

/**
 * @route   DELETE /api/user-devices
 * @desc    Delete a device
 * @access  Private
 */
const deleteDevice = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IDecodedToken;
  const { deviceId } = req.body;

  await UserDeviceService.deleteDevice(user.userId, deviceId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Device deleted successfully',
    data: { deviceId },
  });
});

export const UserDeviceController = {
  registerDevice,
  unregisterDevice,
  getMyDevices,
  deleteDevice,
};
