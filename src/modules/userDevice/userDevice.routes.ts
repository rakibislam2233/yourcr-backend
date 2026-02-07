import { Router } from 'express';
import { auth } from '../../middleware/auth.middleware';
import validateRequest from '../../middleware/validation.middleware';
import { UserRole } from '../../shared/enum/user.enum';
import { UserDeviceController } from './userDevice.controller';
import { UserDeviceValidations } from './userDevice.validation';

const router = Router();

/**
 * @route   POST /api/user-devices/register
 * @desc    Register device for push notifications
 * @access  Private (All authenticated users)
 */
router.post(
  '/register',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR, UserRole.STUDENT),
  validateRequest(UserDeviceValidations.registerDevice),
  UserDeviceController.registerDevice
);

/**
 * @route   POST /api/user-devices/unregister
 * @desc    Unregister device from push notifications
 * @access  Private (All authenticated users)
 */
router.post(
  '/unregister',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR, UserRole.STUDENT),
  validateRequest(UserDeviceValidations.unregisterDevice),
  UserDeviceController.unregisterDevice
);

/**
 * @route   GET /api/user-devices
 * @desc    Get all devices for current user
 * @access  Private (All authenticated users)
 */
router.get(
  '/',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR, UserRole.STUDENT),
  UserDeviceController.getMyDevices
);

/**
 * @route   DELETE /api/user-devices
 * @desc    Delete a device
 * @access  Private (All authenticated users)
 */
router.delete(
  '/',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR, UserRole.STUDENT),
  validateRequest(UserDeviceValidations.deleteDevice),
  UserDeviceController.deleteDevice
);

export const UserDeviceRoutes = router;
