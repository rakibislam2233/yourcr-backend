export type ClassType = 'ONLINE' | 'OFFLINE';
export type ClassStatus = 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export interface ICreateClassPayload {
  subjectId?: string;
  teacherId?: string;
  classDate: string;
  startTime: string;
  endTime: string;
  classType?: ClassType;
  status?: ClassStatus;
  roomNumber?: string;
  joinLink?: string;
  createdById: string;
  batchId: string;
}

export interface IUpdateClassPayload {
  subjectId?: string;
  teacherId?: string;
  classDate?: string;
  startTime?: string;
  endTime?: string;
  classType?: ClassType;
  status?: ClassStatus;
  roomNumber?: string;
  joinLink?: string;
  createdById?: string;
  batchId?: string;
}
