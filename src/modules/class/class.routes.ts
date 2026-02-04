import { Router } from 'express';
import { auth } from '../../middleware/auth.middleware';
import { UserRole } from '../../shared/enum/user.enum';
import validateRequest from '../../middleware/validation.middleware';
import { ClassValidations } from './class.validation';
import { ClassController } from './class.controller';

const router = Router();

router.post(
  '/',
  auth(UserRole.CR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(ClassValidations.createClass),
  ClassController.createClass
);

router.get('/', auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR, UserRole.STUDENT), ClassController.getAllClasses);

router.get('/:id', auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR, UserRole.STUDENT), ClassController.getClassById);

router.patch(
  '/:id',
  auth(UserRole.CR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(ClassValidations.updateClass),
  ClassController.updateClass
);

router.delete(
  '/:id',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  ClassController.deleteClass
);

export const ClassRoutes = router;
