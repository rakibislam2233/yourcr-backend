import colors from 'colors';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../utils/ApiError';
import logger from '../../utils/logger';
import { ICreateUserDevicePayload, UserDeviceRepository } from './userDevice.repository';

export const UserDeviceService = {
  registerDevice: async (payload: ICreateUserDevicePayload) => {
    try {
      const existingDevice = await UserDeviceRepository.getDeviceByUserAndDeviceId(
        payload.userId,
        payload.deviceId || ''
      );

      if (existingDevice) {
        // Update existing device
        const updatedDevice = await UserDeviceRepository.updateDevice(existingDevice.id, {
          fcmToken: payload.fcmToken,
          webPushToken: payload.webPushToken,
          deviceName: payload.deviceName,
          userAgent: payload.userAgent,
          ipAddress: payload.ipAddress,
          isActive: true,
          lastUsedAt: new Date(),
        });

        logger.info(colors.green(`✅ Device updated for user ${payload.userId}`));
        return updatedDevice;
      } else {
        // Create new device
        const newDevice = await UserDeviceRepository.createUserDevice(payload);
        logger.info(colors.green(`✅ New device registered for user ${payload.userId}`));
        return newDevice;
      }
    } catch (error) {
      logger.error(colors.red('❌ Failed to register device:'), error);
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to register device');
    }
  },

  /**
   * Unregister a device
   */
  unregisterDevice: async (userId: string, deviceId: string) => {
    try {
      const result = await UserDeviceRepository.deactivateDeviceByUserAndDeviceId(userId, deviceId);

      if (result.count === 0) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Device not found');
      }

      logger.info(colors.green(`✅ Device unregistered for user ${userId}`));
      return result;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error(colors.red('❌ Failed to unregister device:'), error);
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to unregister device');
    }
  },

  /**
   * Get all devices for a user
   */
  getUserDevices: async (userId: string, activeOnly: boolean = false) => {
    try {
      const devices = await UserDeviceRepository.getUserDevices(userId, activeOnly);
      return devices;
    } catch (error) {
      logger.error(colors.red('❌ Failed to get user devices:'), error);
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to get user devices');
    }
  },

  /**
   * Get active devices with tokens (for sending push notifications)
   */
  getActiveDevicesWithTokens: async (userId: string) => {
    try {
      const devices = await UserDeviceRepository.getActiveDevicesWithTokens(userId);
      return devices;
    } catch (error) {
      logger.error(colors.red('❌ Failed to get active devices:'), error);
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to get active devices');
    }
  },

  /**
   * Deactivate a device (mark as invalid token)
   */
  deactivateDevice: async (deviceId: string) => {
    try {
      const device = await UserDeviceRepository.getDeviceById(deviceId);

      if (!device) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Device not found');
      }

      const updatedDevice = await UserDeviceRepository.deactivateDevice(deviceId);
      logger.warn(colors.yellow(`⚠️  Device ${deviceId} deactivated due to invalid token`));
      return updatedDevice;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error(colors.red('❌ Failed to deactivate device:'), error);
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to deactivate device');
    }
  },

  /**
   * Delete a device
   */
  deleteDevice: async (userId: string, deviceId: string) => {
    try {
      const device = await UserDeviceRepository.getDeviceByUserAndDeviceId(userId, deviceId);

      if (!device) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Device not found');
      }

      await UserDeviceRepository.deleteDevice(device.id);
      logger.info(colors.green(`✅ Device deleted for user ${userId}`));
      return device;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error(colors.red('❌ Failed to delete device:'), error);
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to delete device');
    }
  },

  /**
   * Delete all devices for a user (when user deletes account)
   */
  deleteAllUserDevices: async (userId: string) => {
    try {
      const result = await UserDeviceRepository.deleteUserDevices(userId);
      logger.info(colors.green(`✅ All devices deleted for user ${userId}`));
      return result;
    } catch (error) {
      logger.error(colors.red('❌ Failed to delete user devices:'), error);
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to delete user devices');
    }
  },
};
