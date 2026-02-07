export type NoticeType = 'GENERAL' | 'URGENT' | 'EVENT' | 'EXAM' | 'HOLIDAY';

export interface ICreateNoticePayload {
  title: string;
  fileUrl?: string;
  content: string;
  type: NoticeType;
  isActive?: boolean;
  postedById?: string;
  batchId?: string;
}

export interface IUpdateNoticePayload {
  title?: string;
  fileUrl?: string;
  content?: string;
  type?: NoticeType;
  isActive?: boolean;
  postedById?: string;
  batchId?: string;
}
