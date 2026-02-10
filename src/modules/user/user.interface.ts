import { BatchType } from '../../../prisma/generated/enums';
import { InstitutionType } from '../../shared/enum/institution.enum';
import { UserRole } from '../../shared/enum/user.enum';

export interface ICreateAccountPayload {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role?: UserRole; // Add role field with proper type
}

// Interface for CR to create students
export interface ICreateStudentPayload {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  studentId?: string;
  institutionId?: string;
  batchId?: string;
  crId: string;
}

// User filter options
export interface UserFilterOptions {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  status?: string;
  role?: string;
  isEmailVerified?: boolean;
  search?: string;
}

// User query options
export interface UserQueryOptions extends UserFilterOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

//update institution and batch
export interface IUpdateInstitutionAndBatchPayload {
  institutionInfo: {
    name?: string;
    shortName?: string;
    establishedYear?: string;
    type?: InstitutionType;
    logo?: string;
    contactEmail?: string;
    contactPhone?: string;
    website?: string;
    address?: string;
  };
  // Batch Info
  batchInformation: {
    name?: string;
    batchType?: BatchType;
    department?: string;
    academicYear?: string;
  };
}
