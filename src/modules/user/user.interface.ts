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
  institutionId: string;
  department: string;
  program: string;
  year: string;
  studentId?: string; // Institution-provided student ID
  semester?: string;
  batch?: string;
  crId: string;
}

// NEW: User batch information
export interface IUserBatchInfo {
  batchId: string;
  batchName: string;
  role: 'STUDENT' | 'CR' | 'ASSISTANT_CR';
  studentId?: string;
  enrolledAt: Date;
  isActive: boolean;
}

// Interface for user profile
export interface IUserProfileResponse {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  status: string;
  isCr: boolean;
  academicInfo?: {
    institutionId: string;
    department: string;
    program: string;
    year: string;
    studentId?: string;
    semester?: string;
    batch?: string;
  };
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
