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
  auth(UserRole.CR),
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
