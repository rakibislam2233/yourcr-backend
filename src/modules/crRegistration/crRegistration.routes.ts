import express from 'express';
import { CRRegistrationController } from './crRegistration.controller';
import { auth } from '../../middleware/auth.middleware';

const router = express.Router();

// Complete CR registration with institution and session info
router.post(
  '/',
  auth('STUDENT'),
  CRRegistrationController.completeCRRegistration
);

// Get user's own CR registration
router.get(
  '/my-registration',
  auth('STUDENT', 'CR', 'ADMIN', 'SUPER_ADMIN'),
  CRRegistrationController.getMyCRRegistration
);

// Get all CR registrations (admin only)
router.get(
  '/',
  auth('ADMIN', 'SUPER_ADMIN'),
  CRRegistrationController.getAllCRRegistrations
);

// Approve CR registration (admin only)
router.patch(
  '/:registrationId/approve',
  auth('ADMIN', 'SUPER_ADMIN'),
  CRRegistrationController.approveCRRegistration
);

// Reject CR registration (admin only)
router.patch(
  '/:registrationId/reject',
  auth('ADMIN', 'SUPER_ADMIN'),
  CRRegistrationController.rejectCRRegistration
);

export const CRRegistrationRoutes = router;