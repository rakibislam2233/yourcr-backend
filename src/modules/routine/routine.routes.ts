import { Router } from 'express';
import { auth } from '../../middleware/auth.middleware';
import { UserRole } from '../../shared/enum/user.enum';
import validateRequest from '../../middleware/validation.middleware';
import { RoutineValidations } from './routine.validation';
import { RoutineController } from './routine.controller';

const router = Router();

router.post(
  '/',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR),
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

router.delete(
  '/:id',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  RoutineController.deleteRoutine
);

export const RoutineRoutes = router;
