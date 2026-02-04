export interface ICreateSubjectPayload {
  name: string;
  code?: string;
  credit?: number;
  teacherId?: string;
  description?: string;
  roomNumber?: string;
  isDepartmental?: boolean;
  createdById?: string;
}

export interface IUpdateSubjectPayload {
  name?: string;
  code?: string;
  credit?: number;
  teacherId?: string;
  description?: string;
  roomNumber?: string;
  isDepartmental?: boolean;
  isDeleted?: boolean;
  createdById?: string;
}
