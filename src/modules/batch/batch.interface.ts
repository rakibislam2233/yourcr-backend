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