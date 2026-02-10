import { Request } from 'express';
import { StatusCodes } from 'http-status-codes';
import { database } from '../../config/database.config';
import { AuditAction } from '../../shared/enum/audit.enum';
import { CRRegistrationStatus } from '../../shared/enum/crRegistration.enum';
import { UserRole } from '../../shared/enum/user.enum';
import ApiError from '../../utils/ApiError';
import { createAuditLog } from '../../utils/audit.helper';
import {
  sendCRRegistrationApprovedEmail,
  sendCRRegistrationRejectedEmail,
  sendPendingCRRegistrationEmail,
} from '../../utils/emailTemplates';
import { RedisUtils } from '../../utils/redis.utils';
import { uploadFile } from '../../utils/storage.utils';
import { AUTH_CACHE_KEY } from '../auth/auth.cache';
import { InstitutionRepository } from '../institution/institution.repository';
import { UserRepository } from '../user/user.repository';
import { upload_cr_registration_folder } from './crRegistration.constant';
import { ICompleteCRRegistrationPayload } from './crRegistration.interface';
import { CRRegistrationRepository } from './crRegistration.repository';

const completeCRRegistration = async (
  sessionId: string,
  payload: ICompleteCRRegistrationPayload,
  file: Express.Multer.File,
  req?: Request
) => {
  // 1. Verify sessionId and get userId
  const sessionKey = AUTH_CACHE_KEY.REGISTRATION_SESSION(sessionId);
  const sessionData = await RedisUtils.getCache<{ userId: string }>(sessionKey);

  if (!sessionData || !sessionData.userId) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid or expired registration session');
  }

  const userId = sessionData.userId;

  // Audit log
  await createAuditLog(
    userId,
    AuditAction.USER_REGISTERED,
    'CRRegistration',
    undefined,
    { payload },
    req
  );

  // 2. Check if user exists
  const user = await UserRepository.getUserById(userId);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  // 2. Check if user has verified email
  if (!user.isEmailVerified) {
    return {
      message: 'Email not verified yet. Please verify your email first.',
      data: {
        email: user.email,
        needVerifyMail: true,
      },
    };
  }

  // 3. Check if user already has CR registration or is already a CR
  if (user.role === UserRole.CR) {
    throw new ApiError(StatusCodes.CONFLICT, 'You are already registered as a CR.');
  }

  const existingRegistration = await CRRegistrationRepository.getCRRegistrationByUserId(userId);
  if (existingRegistration) {
    throw new ApiError(
      StatusCodes.CONFLICT,
      `CR registration already exists with status ${existingRegistration.status}`
    );
  }

  // 4. Create or get institution first (Trimmed and case-insensitive)
  const institutionName = payload.institutionInfo.name.trim();
  let institution = await InstitutionRepository.getInstitutionByNameAndType(
    institutionName,
    payload.institutionInfo.type
  );

  if (!institution) {
    institution = await InstitutionRepository.createInstitution({
      ...payload.institutionInfo,
      name: institutionName,
    });
  }

  // 5. Check if batch already exists using session with institutionId
  const existingBatch = await CRRegistrationRepository.checkExistingBatchWithCRs({
    institutionId: institution.id,
    ...payload.batchInformation,
  });

  // Only prevent CR registration if batch exists with ACTIVE CRs
  const batchWithEnrollments = existingBatch as any;
  if (
    batchWithEnrollments &&
    batchWithEnrollments.enrollments &&
    batchWithEnrollments.enrollments.length > 0
  ) {
    const activeCRs = batchWithEnrollments.enrollments.filter(
      (enrollment: any) => enrollment.isActive && enrollment.role === 'CR'
    );

    if (activeCRs.length > 0) {
      const existingCRs = activeCRs.map((cr: any) => cr.user);
      throw new ApiError(
        StatusCodes.CONFLICT,
        `Batch already exists with active CRs. Please contact the CR (${existingCRs.map((cr: any) => `${cr.fullName}`).join(', ')}) to add you to the batch.`
      );
    }
  }

  // 6. Upload file to Cloudinary
  const uploadResult = await uploadFile(
    file.buffer,
    upload_cr_registration_folder,
    `cr_proof_${userId}_${Date.now()}`
  );
  const documentProofUrl = uploadResult.secure_url;

  // 7. Use Prisma transaction for data consistency
  const result = await database.$transaction(async (tx: any) => {
    // Create CR registration using transaction
    const crRegistration = await tx.cRRegistration.create({
      data: {
        userId,
        institutionId: institution.id,
        documentProof: documentProofUrl,
        status: CRRegistrationStatus.PENDING,
      },
      include: {
        user: true,
        institution: true,
      },
    });

    // Update user with CR info using transaction
    await tx.user.update({
      where: { id: userId },
      data: {
        isRegistrationComplete: true,
        institutionId: institution.id,
      },
    });

    // Create batch if it doesn't exist (transaction-based approach)
    let batch;
    if (!existingBatch) {
      batch = await tx.batch.create({
        data: {
          institutionId: institution.id,
          ...payload.batchInformation,
          createdBy: userId,
        },
      });
    } else {
      batch = existingBatch;
    }

    return {
      crRegistration,
      batch,
    };
  });

  // 8. Send pending email (outside transaction)
  await sendPendingCRRegistrationEmail(user.email, user.fullName, institution.name);

  // 9. Clear session
  await RedisUtils.deleteCache(sessionKey);

  return {
    email: user.email,
    crRegistrationStatus: result.crRegistration.status,
    institution: institution.name,
    batch: result.batch
      ? {
          id: result.batch.id,
          ...result.batch,
        }
      : null,
    message: 'CR registration submitted successfully. Please wait for admin approval.',
  };
};

const getAllCRRegistrations = async () => {
  return await CRRegistrationRepository.getAllCRRegistrations();
};

const approveCRRegistration = async (registrationId: string, req?: Request) => {
  const registration = await CRRegistrationRepository.getCRRegistrationById(registrationId);

  if (!registration) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'CR registration not found');
  }

  if (registration.status === CRRegistrationStatus.APPROVED) {
    throw new ApiError(StatusCodes.CONFLICT, 'CR registration already approved');
  }

  // Use Prisma transaction for approval process
  const result = await database.$transaction(async (tx: any) => {
    // Update registration status
    const updatedRegistration = await tx.cRRegistration.update({
      where: { id: registrationId },
      data: {
        status: CRRegistrationStatus.APPROVED,
      },
      include: {
        user: true,
        institution: true,
      },
    });

    // Find existing batch for this user and institution, or create a new one
    let batch;

    // First try to find a batch created by this user for this institution
    const userCreatedBatches = await tx.batch.findMany({
      where: {
        institutionId: registration.institutionId,
        createdBy: registration.userId,
      },
      take: 1,
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (userCreatedBatches.length > 0) {
      // Use the batch created by the user during registration
      batch = userCreatedBatches[0];
    } else {
      // Create a new batch as fallback
      batch = await tx.batch.create({
        data: {
          institutionId: registration.institutionId,
          department: 'General',
          session: new Date().getFullYear().toString(),
          batchType: 'SEMESTER',
          academicYear: new Date().getFullYear().toString(),
          createdBy: registration.userId,
        },
      });
    }

    // Update user role to CR, set approval time AND set currentBatchId
    await tx.user.update({
      where: { id: registration.userId },
      data: {
        role: UserRole.CR,
        isCr: true,
        crApprovedAt: new Date(),
        currentBatchId: batch.id,
      },
    });

    // Add CR to batch enrollment
    await tx.batchEnrollment.create({
      data: {
        batchId: batch.id,
        userId: registration.userId,
        role: 'CR',
        studentId: registration.user.fullName,
        enrolledBy: req?.user?.id,
      },
    });

    return {
      updatedRegistration,
      batch,
    };
  });

  // Send approval email (outside transaction)
  const user = await UserRepository.getUserById(registration.userId);
  const institution = await InstitutionRepository.getInstitutionById(registration.institutionId);

  if (user && institution) {
    await sendCRRegistrationApprovedEmail(user.email, user.fullName, institution.name);
    await createAuditLog(
      registration.userId,
      AuditAction.CR_APPROVED,
      'CRRegistration',
      registrationId,
      { institutionName: institution.name, batchId: result.batch.id },
      req
    );
  }

  return result.updatedRegistration;
};

const rejectCRRegistration = async (registrationId: string, reason: string, req?: Request) => {
  const registration = await CRRegistrationRepository.getCRRegistrationById(registrationId);

  if (!registration) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'CR registration not found');
  }

  // Fetch user and institution info before deletion to send email and logs
  const user = await UserRepository.getUserById(registration.userId);
  const institution = await InstitutionRepository.getInstitutionById(registration.institutionId);

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  // 1. Send rejection email (do this before deleting the user)
  if (institution) {
    await sendCRRegistrationRejectedEmail(user.email, user.fullName, institution.name, reason);
  }

  // 2. Clear Audit Log association (optional, but good for data integrity)
  // 3. Remove from database as requested
  await database.$transaction(async (tx: any) => {
    // Delete any batches created by this user for this registration (optional cleanup)
    await tx.batch.deleteMany({
      where: {
        createdBy: registration.userId,
        institutionId: registration.institutionId,
      },
    });

    // Delete registration record
    await tx.cRRegistration.delete({
      where: { id: registrationId },
    });

    // Delete user record
    await tx.user.delete({
      where: { id: registration.userId },
    });
  });

  // 4. Audit log (without user relation)
  await createAuditLog(
    null as any, // User is deleted
    AuditAction.CR_REJECTED,
    'CRRegistration',
    registrationId,
    {
      institutionName: institution?.name,
      reason,
      rejectedUserEmail: user.email,
      rejectedUserName: user.fullName,
    },
    req
  );

  return { message: 'Registration rejected and user removed successfully' };
};

export const CRRegistrationService = {
  completeCRRegistration,
  getAllCRRegistrations,
  approveCRRegistration,
  rejectCRRegistration,
};
