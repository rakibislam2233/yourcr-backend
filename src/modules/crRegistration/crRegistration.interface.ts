import { InstitutionType } from '../../shared/enum/institution.enum';

export interface ICompleteCRRegistrationPayload {
  institutionInfo: {
    name: string;
    type: InstitutionType;
    contactEmail: string;
    contactPhone?: string;
    address: string;
  };
  // Batch Info
  batchInfo: {
    name: string;
    batchType: 'SEMESTER' | 'YEAR';
    department: string;
    academicYear: string;
  };
  documentProof: string; 
}

// NEW: CR Registration with batch creation
export interface ICRRegistrationWithBatchPayload {
  userId: string;
  institutionId: string;
  documentProof: string;
  batchInfo: {
    name: string;
    batchType: 'SEMESTER' | 'YEAR';
    department: string;
    academicYear: string;
  };
}
