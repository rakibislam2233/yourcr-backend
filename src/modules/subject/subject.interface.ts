export interface ICreateSubjectPayload {
  name: string;
  code?: string;
  credit?: string;
  teacherId?: string;
  description?: bigint;
  roomNumber?: string;
}

export interface IUpdateSubjectPayload {
  name?: string;
  code?: string;
  credit?: string;
  teacherId?: string;
  description?: bigint;
  roomNumber?: string;
  isDeleted?: boolean;
}
