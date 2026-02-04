import { Router } from 'express';
import { auth } from '../../middleware/auth.middleware';
import { UserRole } from '../../shared/enum/user.enum';
import validateRequest from '../../middleware/validation.middleware';
import { AssessmentValidations } from './assessment.validation';
import { AssessmentController } from './assessment.controller';

const router = Router();

router.post(
  '/',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR),
  validateRequest(AssessmentValidations.createAssessment),
  AssessmentController.createAssessment
);

router.get('/', AssessmentController.getAllAssessments);

router.get('/:id', AssessmentController.getAssessmentById);

router.patch(
  '/:id',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR),
  validateRequest(AssessmentValidations.updateAssessment),
  AssessmentController.updateAssessment
);

router.delete(
  '/:id',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  AssessmentController.deleteAssessment
);

export const AssessmentRoutes = router;
