import { Router } from 'express';
import { auth } from '../../middleware/auth.middleware';
import validateRequest from '../../middleware/validation.middleware';
import { UserRole } from '../../shared/enum/user.enum';
import { AssessmentSubmissionController } from './assessmentSubmission.controller';
import { AssessmentSubmissionValidations } from './assessmentSubmission.validation';

import upload from '../../utils/fileUpload.utils';

const router = Router();

router.post(
  '/',
  auth(UserRole.STUDENT),
  upload.array('files', 5),
  validateRequest(AssessmentSubmissionValidations.createAssessmentSubmission),
  AssessmentSubmissionController.submitAssessment
);

router.get(
  '/',
  auth(UserRole.CR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  AssessmentSubmissionController.getAllSubmissions
);

router.get('/my', auth(UserRole.STUDENT), AssessmentSubmissionController.getMySubmissions);

router.get(
  '/:id',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR, UserRole.STUDENT),
  AssessmentSubmissionController.getSubmissionById
);

router.patch(
  '/:id',
  auth(UserRole.STUDENT),
  upload.array('files', 5),
  validateRequest(AssessmentSubmissionValidations.updateAssessmentSubmission),
  AssessmentSubmissionController.updateSubmission
);

export const AssessmentSubmissionRoutes = router;
