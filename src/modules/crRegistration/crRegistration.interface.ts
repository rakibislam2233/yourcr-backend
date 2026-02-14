import { InstitutionType } from '../../../prisma/generated/enums';
import { IBatchInfo } from '../batch/batch.interface';

export interface ICompleteCRRegistrationPayload {
  institutionInfo: {
    name: string;
    type: InstitutionType;
    contactEmail: string;
    contactPhone?: string;
    address: string;
  };
  // Batch Info
  batchInformation: IBatchInfo;
  documentProof?: string;
}

// NEW: CR Registration with batch creation
export interface ICRRegistrationWithBatchPayload {
  userId: string;
  institutionId: string;
  documentProof: string;
  batchInfo: IBatchInfo;
}
