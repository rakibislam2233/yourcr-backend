import { z } from 'zod';

const registerDevice = z.object({
  body: z
    .object({
      deviceType: z.enum(['web', 'android', 'ios'], {
        message: 'Device type must be web, android, or ios',
      }),
      deviceName: z.string().optional(),
      deviceId: z.string().optional(),
      fcmToken: z.string().optional(),
      webPushToken: z.string().optional(),
    })
    .refine(
      data => {
        // At least one token must be provided
        return data.fcmToken || data.webPushToken;
      },
      {
        message: 'Either fcmToken or webPushToken must be provided',
      }
    ),
});

const unregisterDevice = z.object({
  body: z.object({
    deviceId: z
      .string({
        message: 'Device ID is required',
      })
      .min(1, 'Device ID cannot be empty'),
  }),
});

const deleteDevice = z.object({
  body: z.object({
    deviceId: z
      .string({
        message: 'Device ID is required',
      })
      .min(1, 'Device ID cannot be empty'),
  }),
});

export const UserDeviceValidations = {
  registerDevice,
  unregisterDevice,
  deleteDevice,
};
