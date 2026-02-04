import { StatusCodes } from 'http-status-codes';
import { database } from '../../config/database.config';
import ApiError from '../../utils/ApiError';
import { ICompleteCRRegistrationPayload } from './crRegistration.interface';
import { UserRepository } from '../user/user.repository';
import { CRRegistrationRepository } from './crRegistration.repository';
import { CRRegistrationStatus } from '../../shared/enum/crRegistration.enum';
import { UserRole } from '../../shared/enum/user.enum';

const completeCRRegistration = async (userId: string, payload: ICompleteCRRegistrationPayload) => {
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

  // 4. Create or get institution
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

  // 5. Create CR registration
  const crRegistration = await CRRegistrationRepository.createCRRegistration({
    userId,
    institutionId: institution.id,
    documentProof: payload.documentProof,
  });

  // 6. Update user with CR info (Version 1: Simple)
  await database.user.update({
    where: { id: userId },
    data: {
      isCr: true,
      institutionId: institution.id,
      department: payload.programInfo.department,
      program: payload.programInfo.programName,
      year: payload.programInfo.academicYear,
    },
  });

  return {
    ...crRegistration,
    programInfo: payload.programInfo,
  };
};

const getCRRegistrationByUserId = async (userId: string) => {
  return await CRRegistrationRepository.getCRRegistrationByUserId(userId);
};

const getAllCRRegistrations = async () => {
  return await CRRegistrationRepository.getAllCRRegistrations();
};

const approveCRRegistration = async (registrationId: string, adminId: string) => {
  const registration = await CRRegistrationRepository.getCRRegistrationById(registrationId);

  if (!registration) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'CR registration not found');
  }

  if (registration.status === CRRegistrationStatus.APPROVED) {
    throw new ApiError(StatusCodes.CONFLICT, 'CR registration already approved');
  }

  // Update registration status
  const updatedRegistration = await CRRegistrationRepository.approveCRRegistration(registrationId, adminId);

  // Update user role to CR and set approval time
  await database.user.update({
    where: { id: registration.userId },
    data: {
      role: UserRole.CR,
      crApprovedAt: new Date(),
    },
  });

  return updatedRegistration;
};

const rejectCRRegistration = async (registrationId: string, adminId: string, reason: string) => {
  const registration = await CRRegistrationRepository.getCRRegistrationById(registrationId);

  if (!registration) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'CR registration not found');
  }

  if (registration.status === CRRegistrationStatus.REJECTED) {
    throw new ApiError(StatusCodes.CONFLICT, 'CR registration already rejected');
  }

  // Update registration status
  const updatedRegistration = await CRRegistrationRepository.rejectCRRegistration(registrationId, adminId, reason);

  // Reset user CR status
  await database.user.update({
    where: { id: registration.userId },
    data: {
      isCr: false,
      institutionId: null,
      department: null,
      program: null,
      year: null,
      crApprovedAt: null,
    },
  });

  return updatedRegistration;
};

export const CRRegistrationService = {
  completeCRRegistration,
  getCRRegistrationByUserId,
  getAllCRRegistrations,
  approveCRRegistration,
  rejectCRRegistration,
};