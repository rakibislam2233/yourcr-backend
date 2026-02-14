import { ClassStatus, ClassType, Platform } from '../../../prisma/generated/enums';
export interface ICreateClassPayload {
  subjectId?: string;
  teacherId?: string;
  classDate: string | Date;
  startTime: string | Date;
  endTime: string | Date;
  classType?: ClassType;
  status?: ClassStatus;
  roomNumber?: string;
  joinLink?: string;
  platform?: Platform;
  createdById: string;
  batchId: string;
}

export interface IUpdateClassPayload {
  subjectId?: string;
  teacherId?: string;
  classDate?: string | Date;
  startTime?: string | Date;
  endTime?: string | Date;
  classType?: ClassType;
  status?: ClassStatus;
  roomNumber?: string;
  joinLink?: string;
  platform?: Platform;
  createdById?: string;
  batchId?: string;
}
