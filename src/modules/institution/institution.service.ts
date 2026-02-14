import { StatusCodes } from 'http-status-codes';
import { database } from '../../config/database.config';
import ApiError from '../../utils/ApiError';
import { ICreateInstitutionPayload, IUpdateInstitutionPayload } from './institution.interface';
import { InstitutionRepository } from './institution.repository';
// Create institution
const createInstitution = async (payload: ICreateInstitutionPayload) => {
  // Check if institution already exists
  const existingInstitution = await InstitutionRepository.getInstitutionByNameAndType(
    payload.name,
    payload.type
  );

  if (existingInstitution) {
    throw new ApiError(StatusCodes.CONFLICT, 'Institution with this name and type already exists');
  }

  const institution = await InstitutionRepository.createInstitution(payload);
  return institution;
};

// Get institution by ID
const getInstitutionById = async (id: string) => {
  const institution = await InstitutionRepository.getInstitutionById(id);

  if (!institution) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Institution not found');
  }

  return institution;
};

// Get all institutions
const getAllInstitutions = async () => {
  const institutions = await InstitutionRepository.getAllInstitutions();
  return institutions;
};

// Update institution
const updateInstitution = async (id: string, data: IUpdateInstitutionPayload) => {
  // Check if institution exists
  const existingInstitution = await InstitutionRepository.getInstitutionById(id);
  if (!existingInstitution) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Institution not found');
  }

  // If updating name and type, check for duplicates
  if (data.name && data.type) {
    const duplicateInstitution = await InstitutionRepository.getInstitutionByNameAndType(
      data.name,
      data.type
    );

    if (duplicateInstitution && duplicateInstitution.id !== id) {
      throw new ApiError(StatusCodes.CONFLICT, 'Institution with this name and type already exists');
    }
  }

  const institution = await InstitutionRepository.updateInstitution(id, data);
  return institution;
};

// Delete institution
const deleteInstitution = async (id: string) => {
  // Check if institution exists
  const existingInstitution = await InstitutionRepository.getInstitutionById(id);
  if (!existingInstitution) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Institution not found');
  }

  // Check if institution has associated users or CR registrations
  // (Add this check based on your business logic)

  const institution = await InstitutionRepository.deleteInstitution(id);
  return institution;
};

export const InstitutionService = {
  createInstitution,
  getInstitutionById,
  getAllInstitutions,
  updateInstitution,
  deleteInstitution,
};