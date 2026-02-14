import { Router } from 'express';
import { auth } from '../../middleware/auth.middleware';
import validateRequest from '../../middleware/validation.middleware';
import { SubjectValidations } from './subject.validation';
import { SubjectController } from './subject.controller';
import { UserRole } from '../../../prisma/generated/enums';

const router = Router();

router.post(
  '/',
  auth(UserRole.CR),
  validateRequest(SubjectValidations.createSubject),
  SubjectController.createSubject
);

router.get(
  '/',
  auth(UserRole.STUDENT, UserRole.CR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  SubjectController.getAllSubjects
);

router.get(
  '/:id',
  auth(UserRole.STUDENT, UserRole.CR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  SubjectController.getSubjectById
);

router.patch(
  '/:id',
  auth(UserRole.CR),
  validateRequest(SubjectValidations.updateSubject),
  SubjectController.updateSubject
);

router.delete('/:id', auth(UserRole.CR), SubjectController.deleteSubject);

export const SubjectRoutes = router;
