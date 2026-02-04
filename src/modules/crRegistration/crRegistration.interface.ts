import { InstitutionType } from '../../shared/enum/institution.enum';

export interface ICompleteCRRegistrationPayload {
  institutionInfo: {
    name: string;
    type: InstitutionType;
    contactEmail: string;
    contactPhone?: string;
    address: string;
  };
  //Academic Info
  academicInfo: {
    department: string;
    program: string;
    semester: string;
    year: string;
    studentId: string;
    batch: string;
  };
  documentProof: string; 
}
