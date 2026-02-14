import { Router } from 'express';
import { auth } from '../../middleware/auth.middleware';
import { UserRole } from '../../../prisma/generated/enums';
import { AuditLogController } from './auditLog.controller';

const router = Router();

router.get('/', auth(UserRole.ADMIN, UserRole.SUPER_ADMIN), AuditLogController.getAllAuditLogs);

router.get('/:id', auth(UserRole.ADMIN, UserRole.SUPER_ADMIN), AuditLogController.getAuditLogById);

export const AuditLogRoutes = router;
