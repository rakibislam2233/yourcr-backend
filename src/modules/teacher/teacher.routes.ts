import { Router } from 'express';
import { auth } from '../../middleware/auth.middleware';
import validateRequest from '../../middleware/validation.middleware';
import { TeacherController } from './teacher.controller';
import { TeacherValidations } from './teacher.validation';
import upload from '../../utils/fileUpload.utils';
import { UserRole } from '../../../prisma/generated/enums';

const router = Router();

router.post(
  '/',
  auth(UserRole.CR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  upload.single('photo'),
  validateRequest(TeacherValidations.createTeacher),
  TeacherController.createTeacher
);

router.get(
  '/',
  auth(UserRole.STUDENT, UserRole.CR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  TeacherController.getAllTeachers
);

router.get(
  '/:id',
  auth(UserRole.STUDENT, UserRole.CR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  TeacherController.getTeacherById
);

router.patch(
  '/:id',
  upload.single('photo'),
  auth(UserRole.CR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(TeacherValidations.updateTeacher),
  TeacherController.updateTeacher
);

router.delete(
  '/:id',
  auth(UserRole.CR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  TeacherController.deleteTeacher
);

export const TeacherRoutes = router;
