import { Router } from 'express';
import { auth } from '../../middleware/auth.middleware';
import validateRequest from '../../middleware/validation.middleware';
import { UserRole } from '../../shared/enum/user.enum';
import { AssessmentController } from './assessment.controller';
import { AssessmentValidations } from './assessment.validation';

import upload from '../../utils/fileUpload.utils';

const router = Router();

router.post(
  '/',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR),
  upload.array('files', 5),
  validateRequest(AssessmentValidations.createAssessment),
  AssessmentController.createAssessment
);

router.get(
  '/',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR, UserRole.STUDENT),
  AssessmentController.getAllAssessments
);

router.get(
  '/:id',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR, UserRole.STUDENT),
  AssessmentController.getAssessmentById
);

router.patch(
  '/:id',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR),
  upload.array('files', 5),
  validateRequest(AssessmentValidations.updateAssessment),
  AssessmentController.updateAssessment
);

router.delete(
  '/:id',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  AssessmentController.deleteAssessment
);

export const AssessmentRoutes = router;
