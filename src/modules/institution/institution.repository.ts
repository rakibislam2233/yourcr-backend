import { database } from '../../config/database.config';
import { ICreateInstitutionPayload, IUpdateInstitutionPayload } from './institution.interface';

// Create institution
const createInstitution = async (payload: ICreateInstitutionPayload) => {
  const institution = await database.institution.create({
    data: payload,
  });
  return institution;
};

// Get institution by ID
const getInstitutionById = async (id: string) => {
  const institution = await database.institution.findUnique({
    where: { id },
    include: {
      users: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          isCr: true,
        },
      },
      crRegistrations: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      },
    },
  });
  return institution;
};

// Get all institutions
const getAllInstitutions = async () => {
  const institutions = await database.institution.findMany({
    include: {
      _count: {
        select: {
          users: true,
          crRegistrations: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return institutions;
};

// Update institution
const updateInstitution = async (id: string, data: IUpdateInstitutionPayload) => {
  const institution = await database.institution.update({
    where: { id },
    data,
  });
  return institution;
};

// Delete institution
const deleteInstitution = async (id: string) => {
  const institution = await database.institution.delete({
    where: { id },
  });
  return institution;
};

// Get institution by name and type (for checking duplicates)
const getInstitutionByNameAndType = async (name: string, type: string) => {
  const institution = await database.institution.findFirst({
    where: {
      name,
      type: type as any,
    },
  });
  return institution;
};

export const InstitutionRepository = {
  createInstitution,
  getInstitutionById,
  getAllInstitutions,
  updateInstitution,
  deleteInstitution,
  getInstitutionByNameAndType,
};