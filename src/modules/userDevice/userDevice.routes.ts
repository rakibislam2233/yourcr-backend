import { Router } from 'express';
import { auth } from '../../middleware/auth.middleware';
import validateRequest from '../../middleware/validation.middleware';
import { UserDeviceController } from './userDevice.controller';
import { UserDeviceValidations } from './userDevice.validation';
import { UserRole } from '../../../prisma/generated/enums';

const router = Router();

router.post(
  '/register',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR, UserRole.STUDENT),
  validateRequest(UserDeviceValidations.registerDevice),
  UserDeviceController.registerDevice
);

router.post(
  '/unregister',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR, UserRole.STUDENT),
  validateRequest(UserDeviceValidations.unregisterDevice),
  UserDeviceController.unregisterDevice
);

router.get(
  '/',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR, UserRole.STUDENT),
  UserDeviceController.getMyDevices
);


router.delete(
  '/',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR, UserRole.STUDENT),
  validateRequest(UserDeviceValidations.deleteDevice),
  UserDeviceController.deleteDevice
);

export const UserDeviceRoutes = router;
