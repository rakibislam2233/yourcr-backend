import { StatusCodes } from 'http-status-codes';
import { database } from '../../config/database.config';
import ApiError from '../../utils/ApiError';
import { ICompleteCRRegistrationPayload } from './crRegistration.interface';
import { UserRepository } from '../user/user.repository';
import { CRRegistrationRepository } from './crRegistration.repository';
import { CRRegistrationStatus } from '../../shared/enum/crRegistration.enum';

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

  // 3. Check if user is already a CR or has pending registration
  const userWithRegistrations = await database.user.findUnique({
    where: { id: userId },
    include: { crRegistrations: true },
  });
  
  if (userWithRegistrations?.role === 'CR' || (userWithRegistrations?.crRegistrations && userWithRegistrations?.crRegistrations.length > 0)) {
    throw new ApiError(StatusCodes.CONFLICT, 'CR registration already exists or pending');
  }

  // 4. Create CR registration (includes institution and session creation)
  const crRegistration = await CRRegistrationRepository.completeCRRegistration(userId, payload);

  // 5. Update user to mark that CR details have been submitted
  await database.user.update({
    where: { id: userId },
    data: {
      isCrDetailsSubmitted: true,
    },
  });

  return crRegistration;
};

const getCRRegistrationByUserId = async (userId: string) => {
  return await CRRegistrationRepository.getCRRegistrationByUserId(userId);
};

const getAllCRRegistrations = async () => {
  return await CRRegistrationRepository.getAllCRRegistrations();
};

const approveCRRegistration = async (registrationId: string, adminId: string) => {
  const registration = await CRRegistrationRepository.getCRRegistrationByUserId(registrationId);

  if (!registration) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'CR registration not found');
  }

  if (registration.status === CRRegistrationStatus.APPROVED) {
    throw new ApiError(StatusCodes.CONFLICT, 'CR registration already approved');
  }

  // Update registration status
  const updatedRegistration = await CRRegistrationRepository.approveCRRegistration(registrationId, adminId);

  // Update user role to CR and mark as approved
  await database.user.update({
    where: { id: registration.userId },
    data: {
      role: 'CR',
      isCrApproved: true,
    },
  });

  return updatedRegistration;
};

const rejectCRRegistration = async (registrationId: string, adminId: string, reason: string) => {
  const registration = await CRRegistrationRepository.getCRRegistrationByUserId(registrationId);

  if (!registration) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'CR registration not found');
  }

  if (registration.status === CRRegistrationStatus.REJECTED) {
    throw new ApiError(StatusCodes.CONFLICT, 'CR registration already rejected');
  }

  // Update registration status
  const updatedRegistration = await CRRegistrationRepository.rejectCRRegistration(registrationId, adminId, reason);

  return updatedRegistration;
};

export const CRRegistrationService = {
  completeCRRegistration,
  getCRRegistrationByUserId,
  getAllCRRegistrations,
  approveCRRegistration,
  rejectCRRegistration,
};