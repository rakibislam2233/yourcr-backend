import { Router } from 'express';
import { auth } from '../../middleware/auth.middleware';
import validateRequest from '../../middleware/validation.middleware';
import { UserRole } from '../../shared/enum/user.enum';
import { IssueController } from './issue.controller';
import { IssueValidations } from './issue.validation';
import upload from '../../utils/fileUpload.utils';

const router = Router();

router.post(
  '/',
  auth(UserRole.STUDENT),
  upload.single('file'),
  validateRequest(IssueValidations.createIssue),
  IssueController.createIssue
);

router.get(
  '/',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR),
  IssueController.getAllIssues
);

router.get(
  '/:id',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR, UserRole.STUDENT),
  IssueController.getIssueById
);

router.patch(
  '/:id',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR),
  upload.single('file'),
  validateRequest(IssueValidations.updateIssue),
  IssueController.updateIssue
);

router.delete('/:id', auth(UserRole.ADMIN, UserRole.SUPER_ADMIN), IssueController.deleteIssue);

export const IssueRoutes = router;
