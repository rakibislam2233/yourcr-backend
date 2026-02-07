export type RoutineType = 'CLASS' | 'EXAM';

export interface ICreateRoutinePayload {
  name: string;
  fileUrl: string;
  type: RoutineType;
  createdById?: string;
  batchId?: string;
}

export interface IUpdateRoutinePayload {
  name?: string;
  fileUrl?: string;
  type?: RoutineType;
  createdById?: string;
  batchId?: string;
}
