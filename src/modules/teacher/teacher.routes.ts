import { Router } from 'express';
import { auth } from '../../middleware/auth.middleware';
import { UserRole } from '../../shared/enum/user.enum';
import validateRequest from '../../middleware/validation.middleware';
import { TeacherValidations } from './teacher.validation';
import { TeacherController } from './teacher.controller';

const router = Router();

router.post(
  '/',
  auth(UserRole.CR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(TeacherValidations.createTeacher),
  TeacherController.createTeacher
);

router.get('/', TeacherController.getAllTeachers);

router.get('/:id', TeacherController.getTeacherById);

router.patch(
  '/:id',
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
