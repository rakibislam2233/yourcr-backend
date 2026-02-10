export interface ICreateBatchPayload {
  institutionId: string;
  batchType: 'SEMESTER' | 'YEAR';
  department: string;
  session: string;
  academicYear: string;
  semester?: string;
  shift?: string;
  group?: string;
  createdBy?: string;
}

export interface IUpdateBatchPayload {
  batchType?: 'SEMESTER' | 'YEAR';
  department?: string;
  session?: string;
  academicYear?: string;
  semester?: string;
  shift?: string;
  group?: string;
  isActive?: boolean;
  isArchived?: boolean;
}
