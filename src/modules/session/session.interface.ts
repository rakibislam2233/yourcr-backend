import { SessionType } from '../../shared/enum/session.enum';

export interface ICreateSession {
  name: string;
  sessionType: SessionType;
  department: string;
  academicYear: string;
}

export interface IUpdateSession {
  name: string;
  sessionType: string;
  department: string;
  academicYear: string;
}
