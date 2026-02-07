export type IssueType = 'ACADEMIC' | 'TECHNICAL' | 'ADMINISTRATIVE' | 'OTHER';
export type IssuePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type IssueStatus = 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface ICreateIssuePayload {
  title: string;
  description: string;
  type: IssueType;
  priority: IssuePriority;
  fileUrl?: string;
  studentId: string;
  batchId: string;
}

export interface IUpdateIssuePayload {
  title?: string;
  description?: string;
  type?: IssueType;
  priority?: IssuePriority;
  status?: IssueStatus;
  fileUrl?: string;
  resolution?: string;
  resolvedById?: string;
  resolvedAt?: string;
}
