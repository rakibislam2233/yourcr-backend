import { Router } from 'express';
import { auth } from '../../middleware/auth.middleware';
import { UserRole } from '../../../prisma/generated/enums';
import { BatchController } from './batch.controller';
import { BatchValidations } from './batch.validation';
import validateRequest from '../../middleware/validation.middleware';

const router = Router();

// ── Batch Routes ───────────────────────────────────────────────────────
router.post(
  '/',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(BatchValidations.createBatchValidation),
  BatchController.createBatch
);

router.get(
  '/',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR, UserRole.STUDENT),
  BatchController.getAllBatches
);

router.get(
  '/:id',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR, UserRole.STUDENT),
  BatchController.getBatchById
);

router.patch(
  '/:id',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(BatchValidations.updateBatchValidation),
  BatchController.updateBatch
);

router.delete(
  '/:id',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  BatchController.deleteBatch
);

// ── Check Existing Batch (for CR registration) ──────────────────────
router.get(
  '/check-existing',
  auth(UserRole.CR, UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.STUDENT),
  validateRequest(BatchValidations.checkExistingBatchValidation),
  BatchController.checkExistingBatch
);

// ── Batch Enrollment Routes ─────────────────────────────────────────────
router.post(
  '/:batchId/enrollments',
  auth(UserRole.CR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(BatchValidations.createBatchEnrollmentValidation),
  BatchController.createBatchEnrollment
);

router.get(
  '/:batchId/enrollments',
  auth(UserRole.CR, UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.STUDENT),
  BatchController.getAllBatchEnrollments
);

router.get(
  '/:batchId/members',
  auth(UserRole.CR, UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.STUDENT),
  BatchController.getBatchMembers
);

router.get(
  '/enrollments/:id',
  auth(UserRole.CR, UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.STUDENT),
  BatchController.getBatchEnrollmentById
);

router.patch(
  '/enrollments/:id',
  auth(UserRole.CR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(BatchValidations.updateBatchEnrollmentValidation),
  BatchController.updateBatchEnrollment
);

router.delete(
  '/enrollments/:id',
  auth(UserRole.CR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  BatchController.deleteBatchEnrollment
);

// ── Helper Routes ───────────────────────────────────────────────────────
router.get(
  '/institution/:institutionId/batches',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR, UserRole.STUDENT),
  BatchController.getBatchesByInstitution
);

router.get(
  '/user/:userId/batches',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR, UserRole.STUDENT),
  BatchController.getUserBatches
);

router.get(
  '/:batchId/crs',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CR, UserRole.STUDENT),
  BatchController.getBatchCRs
);

export const BatchRoutes = router;
