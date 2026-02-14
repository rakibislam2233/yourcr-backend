import { Router } from 'express';
import { auth } from '../../middleware/auth.middleware';
import validateRequest from '../../middleware/validation.middleware';
import { InstitutionController } from './institution.controller';
import { InstitutionValidations } from './institution.validation';
import upload from '../../utils/fileUpload.utils';
import { UserRole } from '../../../prisma/generated/enums';

const router = Router();

// Create institution (Admin only) with logo upload
router.post(
  '/',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  upload.single('logo'),
  validateRequest(InstitutionValidations.createInstitution),
  InstitutionController.createInstitution
);

// Get all institutions (Public)
router.get('/', InstitutionController.getAllInstitutions);

// Get institution by ID (Public)
router.get('/:id', InstitutionController.getInstitutionById);

// Update institution (Admin only)
router.patch(
  '/:id',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(InstitutionValidations.updateInstitution),
  InstitutionController.updateInstitution
);

// Delete institution (Admin only)
router.delete(
  '/:id',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  InstitutionController.deleteInstitution
);

export const InstitutionRoutes = router;
