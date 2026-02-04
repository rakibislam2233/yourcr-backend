import express from 'express';
import { CRRegistrationController } from './crRegistration.controller';
import { auth } from '../../middleware/auth.middleware';
import { UserRole } from '../../shared/enum/user.enum';
import validateRequest from '../../middleware/validation.middleware';
import { CRRegistrationValidations } from './crRegistration.validation';
import upload from '../../utils/fileUpload.utils';

const router = express.Router();

router.post(
  '/',
  auth(UserRole.STUDENT),
  upload.single('documentProof'),
  validateRequest(CRRegistrationValidations.completeRegistration),
  CRRegistrationController.completeCRRegistration
);

// Get all CR registrations (admin only)
router.get(
  '/',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  CRRegistrationController.getAllCRRegistrations
);

// Approve CR registration (admin only)
router.patch(
  '/:registrationId/approve',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  CRRegistrationController.approveCRRegistration
);

// Reject CR registration (admin only)
router.patch(
  '/:registrationId/reject',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  CRRegistrationController.rejectCRRegistration
);

export const CRRegistrationRoutes = router;
