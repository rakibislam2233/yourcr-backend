import { StatusCodes } from 'http-status-codes';
import ApiError from '../../utils/ApiError';
import { ICompleteCRRegistrationPayload } from './crRegistration.interface';
import { UserRepository } from '../user/user.repository';
import { CRRegistrationRepository } from './crRegistration.repository';
import { InstitutionRepository } from '../institution/institution.repository';
import { BatchEnrollmentRepository } from '../batchEnrollment/batchEnrollment.repository';
import { BatchRepository } from '../batch/batch.repository';
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
    throw new ApiError(StatusCodes.CONFLICT, 'CR registration already exists or pending');
  }

  // 4. Check if batch already exists
  const existingBatch = await CRRegistrationRepository.checkExistingBatchWithCRs({
    name: payload.batchInfo.name,
    department: payload.batchInfo.department,
    batchType: payload.batchInfo.batchType,
    academicYear: payload.batchInfo.academicYear,
  });

  if (existingBatch && existingBatch.enrollments) {
    const existingCRs = existingBatch.enrollments.map((enrollment: any) => enrollment.user);
    throw new ApiError(
      StatusCodes.CONFLICT,
      `Batch already exists. Please contact existing CR(s): ${existingCRs.map((cr: any) => `${cr.fullName} (${cr.email})`).join(', ')}`
    );
  }

  // 5. Upload file to Cloudinary
  const uploadResult = await uploadFile(
    file.buffer,
    upload_cr_registration_folder,
    `cr_proof_${userId}_${Date.now()}`
  );
  const documentProofUrl = uploadResult.secure_url;

  // 6. Create or get institution using repository
  let institution = await InstitutionRepository.getInstitutionByNameAndType(
    payload.institutionInfo.name,
    payload.institutionInfo.type
  );

  if (!institution) {
    institution = await InstitutionRepository.createInstitution(payload.institutionInfo);
  }

  // 7. Create CR registration using repository
  const crRegistration = await CRRegistrationRepository.createCRRegistration({
    userId,
    institutionId: institution.id,
    documentProof: documentProofUrl,
  });

  // 8. Update user with CR info using repository
  await UserRepository.updateUserById(userId, {
    isCrDetailsSubmitted: true,
    institutionId: institution.id,
  });

  // 9. Send pending email
  await sendPendingCRRegistrationEmail(user.email, user.fullName, institution.name);

  return {
    email: user.email,
    crRegistrationStatus: crRegistration.status,
    institution: institution.name,
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

  // Update registration status
  const updatedRegistration = await CRRegistrationRepository.approveCRRegistration(registrationId);

  // Update user role to CR and set approval time
  await UserRepository.updateUserById(registration.userId, {
    role: UserRole.CR,
    isCr: true,
    crApprovedAt: new Date(),
  });

  // Create batch for the approved CR
  const batch = await BatchRepository.createBatch({
    institutionId: registration.institutionId,
    name: `${registration.user.fullName}'s Batch`, // Default batch name
    batchType: 'SEMESTER', // Default batch type
    department: 'General', // Default department
    academicYear: new Date().getFullYear().toString(), // Current year
  });

  // Add CR to batch enrollment
  await BatchEnrollmentRepository.createBatchEnrollment({
    batchId: batch.id,
    userId: registration.userId,
    role: 'CR',
    studentId: registration.user.fullName, // Use name as student ID for now
    enrolledBy: req?.user?.id, // Admin who approved
  });

  // Create student account for the CR (self-enrollment)
  const studentData = {
    fullName: registration.user.fullName,
    email: registration.user.email,
    phoneNumber: registration.user.phoneNumber || '',
    password: 'tempPassword123', // You might want to generate a random password
    institutionId: registration.institutionId,
    department: 'General',
    program: 'General Program',
    year: new Date().getFullYear().toString(),
    studentId: registration.user.fullName,
    crId: registration.userId,
  };

  await UserRepository.createStudentAccount(studentData);

  // Send approval email
  const user = await UserRepository.getUserById(registration.userId);
  const institution = await InstitutionRepository.getInstitutionById(registration.institutionId);

  if (user && institution) {
    await sendCRRegistrationApprovedEmail(user.email, user.fullName, institution.name);
    await createAuditLog(
      registration.userId,
      AuditAction.CR_APPROVED,
      'CRRegistration',
      registrationId,
      { institutionName: institution.name, batchId: batch.id },
      req
    );
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
  await UserRepository.updateUserById(registration.userId, {
    isCr: false,
    isCrDetailsSubmitted: false,
    institutionId: null,
    crApprovedAt: null,
  });

  // Send rejection email
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
