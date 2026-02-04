import { Router } from 'express';
import { auth } from '../../middleware/auth.middleware';
import { UserRole } from '../../shared/enum/user.enum';
import validateRequest from '../../middleware/validation.middleware';
import { IssueValidations } from './issue.validation';
import { IssueController } from './issue.controller';

const router = Router();

router.post(
  '/',
  auth(UserRole.STUDENT, UserRole.CR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(IssueValidations.createIssue),
  IssueController.createIssue
);

router.get('/', auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR), IssueController.getAllIssues);

router.get('/:id', auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR, UserRole.STUDENT), IssueController.getIssueById);

router.patch(
  '/:id',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR),
  validateRequest(IssueValidations.updateIssue),
  IssueController.updateIssue
);

router.delete(
  '/:id',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  IssueController.deleteIssue
);

export const IssueRoutes = router;
