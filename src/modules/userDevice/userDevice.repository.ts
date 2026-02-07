import { database } from '../../config/database.config';

export interface ICreateUserDevicePayload {
  userId: string;
  deviceType: 'web' | 'android' | 'ios';
  deviceName?: string;
  deviceId?: string;
  fcmToken?: string;
  webPushToken?: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface IUpdateUserDevicePayload {
  fcmToken?: string;
  webPushToken?: string;
  deviceName?: string;
  userAgent?: string;
  ipAddress?: string;
  isActive?: boolean;
  lastUsedAt?: Date;
}

export const UserDeviceRepository = {
  /**
   * Create a new user device
   */
  createUserDevice: async (payload: ICreateUserDevicePayload) => {
    return await database.userDevice.create({
      data: payload,
    });
  },

  /**
   * Get device by ID
   */
  getDeviceById: async (id: string) => {
    return await database.userDevice.findUnique({
      where: { id },
    });
  },

  /**
   * Get device by userId and deviceId
   */
  getDeviceByUserAndDeviceId: async (userId: string, deviceId: string) => {
    return await database.userDevice.findFirst({
      where: {
        userId,
        deviceId,
      },
    });
  },

  /**
   * Get all devices for a user
   */
  getUserDevices: async (userId: string, activeOnly: boolean = false) => {
    return await database.userDevice.findMany({
      where: {
        userId,
        ...(activeOnly && { isActive: true }),
      },
      orderBy: {
        lastUsedAt: 'desc',
      },
    });
  },

  /**
   * Get active devices with tokens
   */
  getActiveDevicesWithTokens: async (userId: string) => {
    return await database.userDevice.findMany({
      where: {
        userId,
        isActive: true,
        OR: [{ fcmToken: { not: null } }, { webPushToken: { not: null } }],
      },
    });
  },

  /**
   * Update device
   */
  updateDevice: async (id: string, payload: IUpdateUserDevicePayload) => {
    return await database.userDevice.update({
      where: { id },
      data: payload,
    });
  },

  /**
   * Update device by userId and deviceId
   */
  updateDeviceByUserAndDeviceId: async (
    userId: string,
    deviceId: string,
    payload: IUpdateUserDevicePayload
  ) => {
    return await database.userDevice.updateMany({
      where: {
        userId,
        deviceId,
      },
      data: payload,
    });
  },

  /**
   * Deactivate device
   */
  deactivateDevice: async (id: string) => {
    return await database.userDevice.update({
      where: { id },
      data: { isActive: false },
    });
  },

  /**
   * Deactivate device by userId and deviceId
   */
  deactivateDeviceByUserAndDeviceId: async (userId: string, deviceId: string) => {
    return await database.userDevice.updateMany({
      where: {
        userId,
        deviceId,
      },
      data: { isActive: false },
    });
  },

  /**
   * Delete device
   */
  deleteDevice: async (id: string) => {
    return await database.userDevice.delete({
      where: { id },
    });
  },

  /**
   * Delete all devices for a user
   */
  deleteUserDevices: async (userId: string) => {
    return await database.userDevice.deleteMany({
      where: { userId },
    });
  },
};
