export interface ICreateBatchPayload {
  institutionId: string;
  name: string;
  batchType: 'SEMESTER' | 'YEAR';
  department: string;
  academicYear: string;
  createdBy?: string;
}

export interface IUpdateBatchPayload {
  name?: string;
  batchType?: 'SEMESTER' | 'YEAR';
  department?: string;
  academicYear?: string;
  isActive?: boolean;
  isArchived?: boolean;
}