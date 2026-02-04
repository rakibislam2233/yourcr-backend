import { InstitutionType } from '../../shared/enum/institution.enum';

export interface ICompleteCRRegistrationPayload {
  institutionInfo: {
    name: string;
    type: InstitutionType;
    contactEmail: string;
    contactPhone?: string;
    address: string;
  };
  // Version 1: Simple CR Info
  programInfo: {
    programName: string;
    department: string;
    academicYear: string;
  };
  documentProof: string; // File URL or base64 string
}
