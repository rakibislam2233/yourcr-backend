export interface ICreateBatchEnrollmentPayload {
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

export interface IBatchEnrollmentResponse {
  id: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    profileImage?: string;
  };
  batch: {
    id: string;
    name: string;
    batchType: 'SEMESTER' | 'YEAR';
    department: string;
    academicYear: string;
  };
  role: 'STUDENT' | 'CR' | 'ASSISTANT_CR';
  studentId?: string;
  enrolledAt: Date;
  isActive: boolean;
  enrolledBy?: {
    id: string;
    fullName: string;
    email: string;
  };
}

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
