import { Router } from 'express';
import { auth } from '../../middleware/auth.middleware';
import { UserRole } from '../../shared/enum/user.enum';
import { BatchController } from './batch.controller';
import { BatchValidations } from './batch.validation';
import validateRequest from '../../middleware/validation.middleware';

const router = Router();

// Batch Routes
router.post(
  '/',
  auth(UserRole.CR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(BatchValidations.createBatchValidation),
  BatchController.createBatch
);

router.get(
  '/',
  auth(UserRole.CR, UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.STUDENT),
  BatchController.getAllBatches
);

router.get(
  '/:id',
  auth(UserRole.CR, UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.STUDENT),
  BatchController.getBatchById
);

router.patch(
  '/:id',
  auth(UserRole.CR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(BatchValidations.updateBatchValidation),
  BatchController.updateBatch
);

router.delete(
  '/:id',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  BatchController.deleteBatch
);

// Batch Enrollment Routes
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
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  BatchController.deleteBatchEnrollment
);

// Helper Routes
router.get(
  '/cr/:crId/batches',
  auth(UserRole.CR, UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.STUDENT),
  BatchController.getBatchesByCrId
);

router.get(
  '/student/:studentId/batches',
  auth(UserRole.CR, UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.STUDENT),
  BatchController.getStudentBatches
);

export const BatchRoutes = router;
