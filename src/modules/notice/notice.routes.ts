import { Router } from 'express';
import { auth } from '../../middleware/auth.middleware';
import { UserRole } from '../../shared/enum/user.enum';
import validateRequest from '../../middleware/validation.middleware';
import { NoticeValidations } from './notice.validation';
import { NoticeController } from './notice.controller';

const router = Router();

router.post(
  '/',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR, UserRole.STUDENT),
  validateRequest(NoticeValidations.createNotice),
  NoticeController.createNotice
);

router.get('/', NoticeController.getAllNotices);

router.get('/:id', NoticeController.getNoticeById);

router.patch(
  '/:id',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR, UserRole.STUDENT),
  validateRequest(NoticeValidations.updateNotice),
  NoticeController.updateNotice
);

router.delete(
  '/:id',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  NoticeController.deleteNotice
);

export const NoticeRoutes = router;
