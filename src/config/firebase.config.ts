import colors from 'colors';
import admin from 'firebase-admin';
import fs from 'fs';
import logger from '../utils/logger';
import config from './index';

let firebaseApp: admin.app.App | null = null;

export const initializeFirebase = (): admin.app.App | null => {
  try {
    // Check if service account file exists
    const serviceAccountPath = config.firebase.serviceAccountPath;

    if (!serviceAccountPath || !fs.existsSync(serviceAccountPath)) {
      logger.warn(
        colors.yellow(
          '⚠️  Firebase service account file not found. Push notifications will be disabled.'
        )
      );
      logger.warn(colors.yellow(`   Expected path: ${serviceAccountPath}`));
      return null;
    }

    // Initialize Firebase Admin SDK
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: config.firebase.projectId,
    });

    logger.info(colors.green('✅ Firebase Admin SDK initialized'));
    return firebaseApp;
  } catch (error) {
    logger.error(colors.red('❌ Failed to initialize Firebase:'), error);
    return null;
  }
};

export const getFirebaseApp = (): admin.app.App | null => {
  return firebaseApp;
};

export const getFirebaseMessaging = (): admin.messaging.Messaging | null => {
  if (!firebaseApp) {
    return null;
  }
  return admin.messaging(firebaseApp);
};

export default { initializeFirebase, getFirebaseApp, getFirebaseMessaging };
