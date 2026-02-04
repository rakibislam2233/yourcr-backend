import { InstitutionType } from '../../shared/enum/institution.enum';

export interface ICreateInstitutionPayload {
  name: string;
  type: InstitutionType;
  contactEmail: string;
  contactPhone?: string;
  website?: string;
  address: string;
  logo?: string;
}

export interface IUpdateInstitutionPayload {
  name?: string;
  type?: InstitutionType;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  address?: string;
  logo?: string;
  isVerified?: boolean;
}

export interface IInstitutionResponse {
  id: string;
  name: string;
  type: InstitutionType;
  contactEmail: string;
  contactPhone?: string;
  website?: string;
  address: string;
  logo?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
