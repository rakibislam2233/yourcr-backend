import { Router } from 'express';
import { auth } from '../../middleware/auth.middleware';
import validateRequest from '../../middleware/validation.middleware';
import { NoticeController } from './notice.controller';
import { NoticeValidations } from './notice.validation';
import upload from '../../utils/fileUpload.utils';
import { UserRole } from '../../../prisma/generated/enums';

const router = Router();

router.post(
  '/',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR),
  upload.single('file'),
  validateRequest(NoticeValidations.createNotice),
  NoticeController.createNotice
);

router.get(
  '/',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR, UserRole.STUDENT),
  NoticeController.getAllNotices
);

router.get(
  '/:id',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR, UserRole.STUDENT),
  NoticeController.getNoticeById
);

router.patch(
  '/:id',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR),
  upload.single('file'),
  validateRequest(NoticeValidations.updateNotice),
  NoticeController.updateNotice
);

router.delete(
  '/:id',
  auth(UserRole.CR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  NoticeController.deleteNotice
);

export const NoticeRoutes = router;
