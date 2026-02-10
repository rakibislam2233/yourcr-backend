import express from 'express';
import { auth } from '../../middleware/auth.middleware';
import validateRequest from '../../middleware/validation.middleware';
import { UserRole } from '../../shared/enum/user.enum';
import upload from '../../utils/fileUpload.utils';
import { CRRegistrationController } from './crRegistration.controller';
import { CRRegistrationValidations } from './crRegistration.validation';

const router = express.Router();

router.post(
  '/',
  upload.single('documentProof'),
  validateRequest(CRRegistrationValidations.formDataRegistration),
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
  '/approve/:id',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  CRRegistrationController.approveCRRegistration
);

// Reject CR registration (admin only)
router.patch(
  '/reject/:id',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(CRRegistrationValidations.rejectCRRegistration),
  CRRegistrationController.rejectCRRegistration
);

export const CRRegistrationRoutes = router;
