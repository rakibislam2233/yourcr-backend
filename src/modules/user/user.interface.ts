import { BatchType, InstitutionType, UserRole } from '../../../prisma/generated/enums';

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
    establishedYear?: number;
    type?: InstitutionType;
    logo?: string;
    contactEmail?: string;
    contactPhone?: string;
    website?: string;
    address?: string;
  };
  // Batch Info
  batchInformation: {
    batchType?: BatchType;
    department?: string;
    session?: string;
    academicYear?: string;
    semester?: string;
    shift?: string;
    group?: string;
  };
}
