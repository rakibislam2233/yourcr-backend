import { Router } from 'express';
import { auth } from '../../middleware/auth.middleware';
import { NotificationController } from './notification.controller';
import { UserRole } from '../../../prisma/generated/enums';

const router = Router();

router.get(
  '/',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR, UserRole.STUDENT),
  NotificationController.getMyNotifications
);

router.patch(
  '/:id/read',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR, UserRole.STUDENT),
  NotificationController.markNotificationRead
);

router.delete(
  '/:id',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR, UserRole.STUDENT),
  NotificationController.deleteNotification
);

export const NotificationRoutes = router;
