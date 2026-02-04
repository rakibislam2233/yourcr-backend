import { database } from '../../config/database.config';
import { CRRegistrationStatus } from '../../shared/enum/crRegistration.enum';

// Create CR registration
const createCRRegistration = async (data: {
  userId: string;
  institutionId: string;
  documentProof: string;
}) => {
  const crRegistration = await database.cRRegistration.create({
    data: {
      userId: data.userId,
      institutionId: data.institutionId,
      documentProof: data.documentProof,
      status: CRRegistrationStatus.PENDING,
    },
    include: {
      user: true,
      institution: true,
    },
  });

  return crRegistration;
};

// Get CR registration by ID
const getCRRegistrationById = async (id: string) => {
  return await database.cRRegistration.findUnique({
    where: { id },
    include: {
      user: true,
      institution: true,
    },
  });
};

// Get CR registration by user ID
const getCRRegistrationByUserId = async (userId: string) => {
  return await database.cRRegistration.findFirst({
    where: { userId },
    include: {
      user: true,
      institution: true,
    },
  });
};

// Get all CR registrations
const getAllCRRegistrations = async () => {
  return await database.cRRegistration.findMany({
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true,
        },
      },
      institution: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

// Approve CR registration
const approveCRRegistration = async (registrationId: string) => {
  const updatedRegistration = await database.cRRegistration.update({
    where: { id: registrationId },
    data: {
      status: CRRegistrationStatus.APPROVED,
    },
    include: {
      user: true,
      institution: true,
    },
  });

  return updatedRegistration;
};

// Reject CR registration
const rejectCRRegistration = async (registrationId: string, reason: string) => {
  const updatedRegistration = await database.cRRegistration.update({
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

  return updatedRegistration;
};

export const CRRegistrationRepository = {
  createCRRegistration,
  getCRRegistrationById,
  getCRRegistrationByUserId,
  getAllCRRegistrations,
  approveCRRegistration,
  rejectCRRegistration,
};