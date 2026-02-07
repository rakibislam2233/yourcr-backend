import { Router } from 'express';
import { auth } from '../../middleware/auth.middleware';
import validateRequest from '../../middleware/validation.middleware';
import { UserRole } from '../../shared/enum/user.enum';
import { RoutineController } from './routine.controller';
import { RoutineValidations } from './routine.validation';

import upload from '../../utils/fileUpload.utils';

const router = Router();

router.post(
  '/',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR),
  upload.single('file'),
  validateRequest(RoutineValidations.createRoutine),
  RoutineController.createRoutine
);

router.get('/', RoutineController.getAllRoutines);

router.get('/:id', RoutineController.getRoutineById);

router.patch(
  '/:id',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR),
  validateRequest(RoutineValidations.updateRoutine),
  RoutineController.updateRoutine
);

router.delete('/:id', auth(UserRole.ADMIN, UserRole.SUPER_ADMIN), RoutineController.deleteRoutine);

export const RoutineRoutes = router;
