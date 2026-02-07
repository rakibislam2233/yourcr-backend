import colors from 'colors';
import { getFirebaseMessaging } from '../config/firebase.config';
import { UserDeviceService } from '../modules/userDevice/userDevice.service';
import logger from './logger';

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
  clickAction?: string;
}

/**
 * Send push notification to a single user (all their devices)
 */
export const sendPushNotificationToUser = async (
  userId: string,
  payload: PushNotificationPayload
): Promise<void> => {
  try {
    // Get all active devices for this user
    const devices = await UserDeviceService.getActiveDevicesWithTokens(userId);

    if (devices.length === 0) {
      logger.warn(colors.yellow(`⚠️  No active devices found for user ${userId}`));
      return;
    }

    logger.info(colors.blue(`📱 Sending push notification to ${devices.length} device(s)`));

    // Send to all devices
    const promises = devices.map(device => sendPushToDevice(device, payload));
    await Promise.allSettled(promises);
  } catch (error) {
    logger.error(colors.red('❌ Failed to send push notification:'), error);
  }
};

/**
 * Send push notification to multiple users
 */
export const sendPushNotificationToUsers = async (
  userIds: string[],
  payload: PushNotificationPayload
): Promise<void> => {
  const promises = userIds.map(userId => sendPushNotificationToUser(userId, payload));
  await Promise.allSettled(promises);
};

/**
 * Send push to a specific device
 */
const sendPushToDevice = async (
  device: {
    id: string;
    fcmToken: string | null;
    webPushToken: string | null;
  },
  payload: PushNotificationPayload
): Promise<void> => {
  try {
    if (device.fcmToken) {
      // Send via Firebase (Mobile App)
      await sendFCMNotification(device.fcmToken, payload);
    } else if (device.webPushToken) {
      // Send via Web Push (Browser)
      await sendWebPushNotification(device.webPushToken, payload);
    }
  } catch (error: any) {
    logger.error(colors.red(`❌ Failed to send to device ${device.id}:`), error.message);

    // If token is invalid, mark device as inactive
    if (isInvalidTokenError(error)) {
      await UserDeviceService.deactivateDevice(device.id);
    }
  }
};

/**
 * Send FCM notification (for mobile apps)
 */
const sendFCMNotification = async (
  fcmToken: string,
  payload: PushNotificationPayload
): Promise<void> => {
  const messaging = getFirebaseMessaging();

  if (!messaging) {
    logger.warn(colors.yellow('⚠️  Firebase not initialized, skipping FCM notification'));
    return;
  }

  const message = {
    token: fcmToken,
    notification: {
      title: payload.title,
      body: payload.body,
      imageUrl: payload.imageUrl,
    },
    data: payload.data || {},
    android: {
      priority: 'high' as const,
      notification: {
        sound: 'default',
        clickAction: payload.clickAction,
      },
    },
    apns: {
      payload: {
        aps: {
          sound: 'default',
          badge: 1,
        },
      },
    },
  };

  await messaging.send(message);
  logger.info(colors.green(`✅ FCM notification sent successfully`));
};

/**
 * Send Web Push notification (for browsers)
 * TODO: Implement using web-push library
 */
const sendWebPushNotification = async (
  webPushToken: string,
  payload: PushNotificationPayload
): Promise<void> => {
  // Web Push implementation will go here
  // Requires: npm install web-push
  // And VAPID keys configuration

  logger.info(
    colors.cyan(`🌐 Web Push notification queued for token: ${webPushToken.substring(0, 20)}...`)
  );
  logger.warn(
    colors.yellow(
      '⚠️  Web Push not yet implemented. Install web-push library and configure VAPID keys.'
    )
  );

  // TODO: Implement web-push
  // const webpush = require('web-push');
  // webpush.setVapidDetails(
  //   config.webPush.subject,
  //   config.webPush.publicKey,
  //   config.webPush.privateKey
  // );
  // await webpush.sendNotification(
  //   JSON.parse(webPushToken),
  //   JSON.stringify({
  //     title: payload.title,
  //     body: payload.body,
  //     data: payload.data,
  //   })
  // );
};

/**
 * Check if error is due to invalid token
 */
const isInvalidTokenError = (error: any): boolean => {
  const invalidTokenCodes = [
    'messaging/invalid-registration-token',
    'messaging/registration-token-not-registered',
    'messaging/invalid-argument',
  ];

  return invalidTokenCodes.some(code => error.code === code || error.message?.includes(code));
};
