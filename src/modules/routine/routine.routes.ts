import { Router } from 'express';
import { auth } from '../../middleware/auth.middleware';
import validateRequest from '../../middleware/validation.middleware';
import { RoutineController } from './routine.controller';
import { RoutineValidations } from './routine.validation';

import { UserRole } from '../../../prisma/generated/enums';
import upload from '../../utils/fileUpload.utils';
const router = Router();

router.post(
  '/',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR),
  upload.single('fileUrl'),
  validateRequest(RoutineValidations.createRoutine),
  RoutineController.createRoutine
);

router.get(
  '/',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR, UserRole.STUDENT),
  RoutineController.getAllRoutines
);

router.get(
  '/:id',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR, UserRole.STUDENT),
  RoutineController.getRoutineById
);

router.patch(
  '/:id',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR),
  upload.single('fileUrl'),
  validateRequest(RoutineValidations.updateRoutine),
  RoutineController.updateRoutine
);

router.delete('/:id', auth(UserRole.ADMIN, UserRole.SUPER_ADMIN), RoutineController.deleteRoutine);

export const RoutineRoutes = router;
