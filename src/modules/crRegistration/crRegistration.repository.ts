import { database } from '../../config/database.config';
import { ICompleteCRRegistrationPayload } from './crRegistration.interface';
import { CRRegistrationStatus } from '../../shared/enum/crRegistration.enum';

const completeCRRegistration = async (userId: string, payload: ICompleteCRRegistrationPayload) => {
  const { institutionInfo, sessionInfo } = payload;

  // Check if institution already exists or create new
  let institution = await database.institution.findFirst({
    where: {
      name: institutionInfo.name,
      contactEmail: institutionInfo.contactEmail,
    },
  });

  if (!institution) {
    institution = await database.institution.create({
      data: {
        name: institutionInfo.name,
        type: institutionInfo.type,
        contactEmail: institutionInfo.contactEmail,
        contactPhone: institutionInfo.contactPhone || '',
        address: institutionInfo.address,
      },
    });
  }

  // Create session for the institution
  const session = await database.session.create({
    data: {
      institutionId: institution.id,
      name: sessionInfo.name,
      sessionType: sessionInfo.sessionType,
      department: sessionInfo.department,
      academicYear: sessionInfo.academicYear,
      crId: userId,
    },
  });

  // Create CR registration record
  const crRegistration = await database.cRRegistration.create({
    data: {
      userId,
      institutionId: institution.id,
      sessionId: session.id,
      documentProof: '', // This can be updated later when user uploads proof
      status: CRRegistrationStatus.PENDING,
    },
    include: {
      user: true,
      institution: true,
      session: true,
    },
  });

  return crRegistration;
};

const getCRRegistrationByUserId = async (userId: string) => {
  return await database.cRRegistration.findFirst({
    where: { userId },
    include: {
      user: true,
      institution: true,
      session: true,
    },
  });
};

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
      session: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

const approveCRRegistration = async (registrationId: string, adminId: string) => {
  // Update registration status
  const updatedRegistration = await database.cRRegistration.update({
    where: { id: registrationId },
    data: {
      status: CRRegistrationStatus.APPROVED,
      reviewedById: adminId,
      reviewedAt: new Date(),
    },
    include: {
      user: true,
      institution: true,
      session: true,
    },
  });

  return updatedRegistration;
};

const rejectCRRegistration = async (registrationId: string, adminId: string, reason: string) => {
  // Update registration status
  const updatedRegistration = await database.cRRegistration.update({
    where: { id: registrationId },
    data: {
      status: CRRegistrationStatus.REJECTED,
      rejectionReason: reason,
      reviewedById: adminId,
      reviewedAt: new Date(),
    },
    include: {
      user: true,
      institution: true,
      session: true,
    },
  });

  return updatedRegistration;
};

export const CRRegistrationRepository = {
  completeCRRegistration,
  getCRRegistrationByUserId,
  getAllCRRegistrations,
  approveCRRegistration,
  rejectCRRegistration,
};