import { Router } from 'express';
import { auth } from '../../middleware/auth.middleware';
import validateRequest from '../../middleware/validation.middleware';
import { UserRole } from '../../../prisma/generated/enums';
import { AssessmentController } from './assessment.controller';
import { AssessmentValidations } from './assessment.validation';

import upload from '../../utils/fileUpload.utils';

const router = Router();

router
  .route('/')
  .post(
    auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR),
    upload.array('files', 5),
    validateRequest(AssessmentValidations.createAssessment),
    AssessmentController.createAssessment
  )
  .get(
    auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR, UserRole.STUDENT),
    AssessmentController.getAllAssessments
  );

router
  .route('/:id')
  .get(
    auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR, UserRole.STUDENT),
    AssessmentController.getAssessmentById
  )
  .patch(
    auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR),
    upload.array('files', 5),
    validateRequest(AssessmentValidations.updateAssessment),
    AssessmentController.updateAssessment
  )
  .delete(auth(UserRole.ADMIN, UserRole.SUPER_ADMIN), AssessmentController.deleteAssessment);

export const AssessmentRoutes = router;
