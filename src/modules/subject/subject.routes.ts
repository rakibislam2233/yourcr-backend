import { Router } from 'express';
import { auth } from '../../middleware/auth.middleware';
import { UserRole } from '../../shared/enum/user.enum';
import validateRequest from '../../middleware/validation.middleware';
import { SubjectValidations } from './subject.validation';
import { SubjectController } from './subject.controller';

const router = Router();

router.post(
  '/',
  auth(UserRole.CR),
  validateRequest(SubjectValidations.createSubject),
  SubjectController.createSubject
);

router.get('/', SubjectController.getAllSubjects);

router.get('/:id', SubjectController.getSubjectById);

router.patch(
  '/:id',
  auth(UserRole.CR),
  validateRequest(SubjectValidations.updateSubject),
  SubjectController.updateSubject
);

router.delete('/:id', auth(UserRole.CR), SubjectController.deleteSubject);

export const SubjectRoutes = router;
