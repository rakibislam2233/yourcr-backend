export interface ICreateTeacherPayload {
  name: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  designation?: string;
  department?: string;
  createdById: string;
  batchId: string;
}

export interface IUpdateTeacherPayload {
  name?: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  designation?: string;
  department?: string;
  createdById?: string;
  batchId?: string;
}
