export interface ICreateBatchPayload {
  institutionId: string;
  name: string;
  batchType: 'SEMESTER' | 'YEAR';
  department: string;
  academicYear: string;
}

export interface IUpdateBatchPayload {
  name?: string;
  batchType?: 'SEMESTER' | 'YEAR';
  department?: string;
  academicYear?: string;
  isActive?: boolean;
  isArchived?: boolean;
}

export interface IBatchEnrollmentPayload {
  batchId: string;
  userId: string;
  role?: 'STUDENT' | 'CR' | 'ASSISTANT_CR';
  studentId?: string; // Institution-provided student ID/roll number
}

export interface IUpdateBatchEnrollmentPayload {
  role?: 'STUDENT' | 'CR' | 'ASSISTANT_CR';
  studentId?: string;
  isActive?: boolean;
}

// NEW: Get batch members with roles
export interface IBatchMemberResponse {
  id: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    profileImage?: string;
  };
  role: 'STUDENT' | 'CR' | 'ASSISTANT_CR';
  studentId?: string;
  enrolledAt: Date;
  isActive: boolean;
}
