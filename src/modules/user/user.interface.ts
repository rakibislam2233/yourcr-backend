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
  institutionId: string;
  department: string;
  program: string;
  year: string;
  rollNumber: string;
  studentId?: string;
  semester?: string;
  batch?: string;
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
    rollNumber: string;
    studentId?: string;
    semester?: string;
    batch?: string;
  };
}
