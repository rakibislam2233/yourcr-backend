export interface ICreateBatchPayload {
  institutionId: string;
  name: string;
  batchType: 'SEMESTER' | 'YEAR';
  department: string;
  academicYear: string;
  crId: string;
}

export interface IUpdateBatchPayload {
  name?: string;
  batchType?: 'SEMESTER' | 'YEAR';
  department?: string;
  academicYear?: string;
  crId?: string;
  isActive?: boolean;
  isArchived?: boolean;
}

export interface IBatchEnrollmentPayload {
  batchId: string;
  studentId: string;
  studentRollNumber: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'REMOVED';
}

export interface IUpdateBatchEnrollmentPayload {
  studentRollNumber?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'REMOVED';
}
