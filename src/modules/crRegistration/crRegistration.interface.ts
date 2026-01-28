import { InstitutionType } from '../../shared/enum/institution.enum';
import { SessionType } from '../../shared/enum/session.enum';

export interface ICompleteCRRegistrationPayload {
  institutionInfo: {
    name: string;
    type: InstitutionType;
    contactEmail: string;
    contactPhone?: string;
    address: string;
  };
  sessionInfo: {
    name: string;
    sessionType: SessionType;
    department: string;
    academicYear: string;
  };
}
