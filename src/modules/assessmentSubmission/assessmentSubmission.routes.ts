import { Router } from 'express';
import { auth } from '../../middleware/auth.middleware';
import { UserRole } from '../../shared/enum/user.enum';
import validateRequest from '../../middleware/validation.middleware';
import { AssessmentSubmissionValidations } from './assessmentSubmission.validation';
import { AssessmentSubmissionController } from './assessmentSubmission.controller';

const router = Router();

router.post(
  '/',
  auth(UserRole.STUDENT),
  validateRequest(AssessmentSubmissionValidations.createAssessmentSubmission),
  AssessmentSubmissionController.submitAssessment
);

router.get(
  '/my',
  auth(UserRole.STUDENT),
  AssessmentSubmissionController.getMySubmissions
);

router.get(
  '/:id',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR, UserRole.STUDENT),
  AssessmentSubmissionController.getSubmissionById
);

router.patch(
  '/:id',
  auth(UserRole.STUDENT),
  validateRequest(AssessmentSubmissionValidations.updateAssessmentSubmission),
  AssessmentSubmissionController.updateSubmission
);

export const AssessmentSubmissionRoutes = router;
