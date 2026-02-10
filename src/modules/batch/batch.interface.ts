export interface IBatchInfo {
  department: string;
  session: string;
  batchType: 'SEMESTER' | 'YEAR';
  academicYear: string;
  semester?: string;
  shift?: string;
  group?: string;
}

export interface ICreateBatchPayload extends IBatchInfo {
  institutionId: string;
  createdBy?: string;
}

export interface IUpdateBatchPayload {
  department?: string;
  session?: string;
  batchType?: 'SEMESTER' | 'YEAR';
  academicYear?: string;
  semester?: string;
  shift?: string;
  group?: string;
  isActive?: boolean;
  isArchived?: boolean;
}

export interface IBatchFilters extends Partial<IBatchInfo> {
  institutionId?: string;
  isActive?: boolean;
  isArchived?: boolean;
  search?: string;
}
