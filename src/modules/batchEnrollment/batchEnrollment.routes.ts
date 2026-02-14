import { Router } from 'express';
import { auth } from '../../middleware/auth.middleware';
import { UserRole } from '../../../prisma/generated/enums';
import { BatchEnrollmentController } from './batchEnrollment.controller';
import { BatchEnrollmentValidations } from './batchEnrollment.validation';
import validateRequest from '../../middleware/validation.middleware';

const router = Router();

// ── Batch Enrollment Routes ─────────────────────────────────────────────
router.post(
  '/',
  auth(UserRole.CR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(BatchEnrollmentValidations.createBatchEnrollmentValidation),
  BatchEnrollmentController.createBatchEnrollment
);

router.get(
  '/:id',
  auth(UserRole.CR, UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.STUDENT),
  BatchEnrollmentController.getBatchEnrollmentById
);

router.get(
  '/batch/:batchId/enrollments',
  auth(UserRole.CR, UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.STUDENT),
  BatchEnrollmentController.getAllBatchEnrollments
);

router.get(
  '/batch/:batchId/members',
  auth(UserRole.CR, UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.STUDENT),
  BatchEnrollmentController.getBatchMembers
);

router.patch(
  '/:id',
  auth(UserRole.CR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(BatchEnrollmentValidations.updateBatchEnrollmentValidation),
  BatchEnrollmentController.updateBatchEnrollment
);

router.delete(
  '/:id',
  auth(UserRole.CR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  BatchEnrollmentController.deleteBatchEnrollment
);

// ── Helper Routes ───────────────────────────────────────────────────────
router.get(
  '/user/:userId/enrollments',
  auth(UserRole.CR, UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.STUDENT),
  BatchEnrollmentController.getUserEnrollments
);

export const BatchEnrollmentRoutes = router;
