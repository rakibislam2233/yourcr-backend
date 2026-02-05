import { StatusCodes } from 'http-status-codes';
import ApiError from '../../utils/ApiError';
import { ICompleteCRRegistrationPayload } from './crRegistration.interface';
import { UserRepository } from '../user/user.repository';
import { CRRegistrationRepository } from './crRegistration.repository';
import { InstitutionRepository } from '../institution/institution.repository';
import { CRRegistrationStatus } from '../../shared/enum/crRegistration.enum';
import { UserRole } from '../../shared/enum/user.enum';
import { uploadFile } from '../../utils/storage.utils';
import { upload_cr_registration_folder } from './crRegistration.constant';
import {
  sendPendingCRRegistrationEmail,
  sendCRRegistrationApprovedEmail,
  sendCRRegistrationRejectedEmail,
} from '../../utils/emailTemplates';
import { createAuditLog } from '../../utils/audit.helper';
import { AuditAction } from '../../shared/enum/audit.enum';
import { Request } from 'express';
import { database } from '../../config/database.config';

const completeCRRegistration = async (
  userId: string,
  payload: ICompleteCRRegistrationPayload,
  file: Express.Multer.File,
  req?: Request
) => {
  // Audit log
  await createAuditLog(
    userId,
    AuditAction.USER_REGISTERED,
    'CRRegistration',
    undefined,
    { payload },
    req
  );

  // 1. Check if user exists
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

  // 3. Check if user already has CR registration
  const existingRegistration = await CRRegistrationRepository.getCRRegistrationByUserId(userId);
  if (existingRegistration) {
    throw new ApiError(StatusCodes.CONFLICT, `CR registration already exists with status ${existingRegistration.status}`);
  }

  // 4. Create or get institution first
  let institution = await InstitutionRepository.getInstitutionByNameAndType(
    payload.institutionInfo.name,
    payload.institutionInfo.type
  );

  if (!institution) {
    institution = await InstitutionRepository.createInstitution(payload.institutionInfo);
  }

  // 5. Check if batch already exists using session with institutionId
  const existingBatch = await CRRegistrationRepository.checkExistingBatchWithCRs({
    institutionId: institution.id,
    name: payload.batchInformation.name,
    department: payload.batchInformation.department,
    batchType: payload.batchInformation.batchType,
    academicYear: payload.batchInformation.academicYear,
  });

  // Only prevent CR registration if batch exists with ACTIVE CRs
  if (existingBatch && existingBatch.enrollments && existingBatch.enrollments.length > 0) {
    const activeCRs = existingBatch.enrollments.filter((enrollment: any) => 
      enrollment.isActive && enrollment.role === 'CR'
    );
    
    if (activeCRs.length > 0) {
      const existingCRs = activeCRs.map((cr: any) => cr.user);
      throw new ApiError(
        StatusCodes.CONFLICT,
        `Batch already has active CR(s): ${existingCRs.map((cr: any) => `${cr.fullName} (${cr.email})`).join(', ')}`
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
        isCrDetailsSubmitted: true,
        institutionId: institution.id,
      },
    });

    // Create batch if it doesn't exist (transaction-based approach)
    let batch;
    if (!existingBatch) {
      batch = await tx.batch.create({
        data: {
          institutionId: institution.id,
          name: payload.batchInformation.name,
          batchType: payload.batchInformation.batchType,
          department: payload.batchInformation.department,
          academicYear: payload.batchInformation.academicYear,
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

  return {
    email: user.email,
    crRegistrationStatus: result.crRegistration.status,
    institution: institution.name,
    batch: result.batch ? {
      id: result.batch.id,
      name: result.batch.name,
      department: result.batch.department,
      batchType: result.batch.batchType,
      academicYear: result.batch.academicYear,
    } : null,
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

    // Update user role to CR and set approval time
    await tx.user.update({
      where: { id: registration.userId },
      data: {
        role: UserRole.CR,
        isCr: true,
        crApprovedAt: new Date(),
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
          name: `${registration.user.fullName}'s Batch`,
          batchType: 'SEMESTER',
          department: 'General',
          academicYear: new Date().getFullYear().toString(),
          createdBy: registration.userId,
        },
      });
    }

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

  if (registration.status === CRRegistrationStatus.REJECTED) {
    throw new ApiError(StatusCodes.CONFLICT, 'CR registration already rejected');
  }

  // Use Prisma transaction for rejection process
  const updatedRegistration = await database.$transaction(async (tx: any) => {
    // Update registration status
    const result = await tx.cRRegistration.update({
      where: { id: registrationId },
      data: {
        status: CRRegistrationStatus.REJECTED,
        rejectionReason: reason,
      },
      include: {
        user: true,
        institution: true,
      },
    });

    // Reset user CR status
    await tx.user.update({
      where: { id: registration.userId },
      data: {
        isCr: false,
        isCrDetailsSubmitted: false,
        institutionId: null,
        crApprovedAt: null,
      },
    });

    return result;
  });

  // Send rejection email (outside transaction)
  const user = await UserRepository.getUserById(registration.userId);
  const institution = await InstitutionRepository.getInstitutionById(registration.institutionId);

  if (user && institution) {
    await sendCRRegistrationRejectedEmail(user.email, user.fullName, institution.name, reason);
    await createAuditLog(
      registration.userId,
      AuditAction.CR_REJECTED,
      'CRRegistration',
      registrationId,
      { institutionName: institution.name, reason },
      req
    );
  }

  return updatedRegistration;
};

export const CRRegistrationService = {
  completeCRRegistration,
  getAllCRRegistrations,
  approveCRRegistration,
  rejectCRRegistration,
};
