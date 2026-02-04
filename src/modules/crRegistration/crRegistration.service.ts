import { StatusCodes } from 'http-status-codes';
import { database } from '../../config/database.config';
import ApiError from '../../utils/ApiError';
import { ICompleteCRRegistrationPayload } from './crRegistration.interface';
import { UserRepository } from '../user/user.repository';
import { CRRegistrationRepository } from './crRegistration.repository';
import { CRRegistrationStatus } from '../../shared/enum/crRegistration.enum';
import { UserRole } from '../../shared/enum/user.enum';
import { uploadFile } from '../../utils/storage.utils';
import { upload_cr_registration_folder } from './crRegistration.constant';
import { sendPendingCRRegistrationEmail, sendCRRegistrationApprovedEmail, sendCRRegistrationRejectedEmail } from '../../utils/emailTemplates';
import { createAuditLog } from '../../utils/audit.helper';
import { AuditAction } from '../../shared/enum/audit.enum';
import { Request } from 'express';

const completeCRRegistration = async (
  userId: string, 
  payload: { institutionInfo: any; academicInfo: any }, 
  file: Express.Multer.File,
  req?: Request
) => {
  await createAuditLog(userId, AuditAction.USER_REGISTERED, 'CRRegistration', undefined, { payload }, req);

  // 1. Check if user exists
  const user = await UserRepository.getUserById(userId);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  // 2. Check if user has verified email
  if (!user.isEmailVerified) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Please verify your email first');
  }

  // 3. Check if user already has CR registration
  const existingRegistration = await CRRegistrationRepository.getCRRegistrationByUserId(userId);
  if (existingRegistration) {
    throw new ApiError(StatusCodes.CONFLICT, 'CR registration already exists or pending');
  }

  // 4. Upload file to Cloudinary
  const uploadResult = await uploadFile(
    file.buffer, 
    upload_cr_registration_folder,
    `cr_proof_${userId}_${Date.now()}`
  );
  const documentProofUrl = uploadResult.secure_url;

  // 5. Create or get institution
  let institution = await database.institution.findFirst({
    where: {
      name: payload.institutionInfo.name,
      type: payload.institutionInfo.type,
    },
  });

  if (!institution) {
    institution = await database.institution.create({
      data: payload.institutionInfo,
    });
  }

  // 6. Create CR registration
  const crRegistration = await CRRegistrationRepository.createCRRegistration({
    userId,
    institutionId: institution.id,
    documentProof: documentProofUrl,
  });

  // 7. Update user with CR info (Version 1: Simple)
  await database.user.update({
    where: { id: userId },
    data: {
      isCr: true,
      isCrDetailsSubmitted: true,
      institutionId: institution.id,
      program: payload.academicInfo.program,
      year: payload.academicInfo.year,
      department: payload.academicInfo.department,
      studentId: payload.academicInfo.studentId,
      semester: payload.academicInfo.semester,
      batch: payload.academicInfo.batch,
    },
  });

  // 8. Send pending email
  await sendPendingCRRegistrationEmail(user.email, user.fullName, institution.name);

  return {
    email: user.email,
    crRegistrationStatus: crRegistration.status,
    institution: institution.name,
    academicInfo: payload.academicInfo,
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

  // Update registration status
  const updatedRegistration = await CRRegistrationRepository.approveCRRegistration(registrationId);

  // Update user role to CR and set approval time
  await database.user.update({
    where: { id: registration.userId },
    data: {
      role: UserRole.CR,
      crApprovedAt: new Date(),
    },
  });

  // Send approval email
  const user = await UserRepository.getUserById(registration.userId);
  const institution = await database.institution.findUnique({ where: { id: registration.institutionId } });
  
  if (user && institution) {
    await sendCRRegistrationApprovedEmail(user.email, user.fullName, institution.name);
    await createAuditLog(registration.userId, AuditAction.CR_APPROVED, 'CRRegistration', registrationId, { institutionName: institution.name }, req);
  }

  return updatedRegistration;
};

const rejectCRRegistration = async (registrationId: string, reason: string, req?: Request) => {
  const registration = await CRRegistrationRepository.getCRRegistrationById(registrationId);

  if (!registration) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'CR registration not found');
  }

  if (registration.status === CRRegistrationStatus.REJECTED) {
    throw new ApiError(StatusCodes.CONFLICT, 'CR registration already rejected');
  }

  // Update registration status
  const updatedRegistration = await CRRegistrationRepository.rejectCRRegistration(
    registrationId,
    reason
  );

  // Reset user CR status
  await database.user.update({
    where: { id: registration.userId },
    data: {
      isCr: false,
      isCrDetailsSubmitted: false,
      institutionId: null,
      department: null,
      program: null,
      year: null,
      crApprovedAt: null,
    },
  });

  // Send rejection email
  const user = await UserRepository.getUserById(registration.userId);
  const institution = await database.institution.findUnique({ where: { id: registration.institutionId } });
  
  if (user && institution) {
    await sendCRRegistrationRejectedEmail(user.email, user.fullName, institution.name, reason);
    await createAuditLog(registration.userId, AuditAction.CR_REJECTED, 'CRRegistration', registrationId, { institutionName: institution.name, reason }, req);
  }

  return updatedRegistration;
};

export const CRRegistrationService = {
  completeCRRegistration,
  getAllCRRegistrations,
  approveCRRegistration,
  rejectCRRegistration,
};
