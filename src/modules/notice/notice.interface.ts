export type NoticeType = 'GENERAL' | 'URGENT' | 'EVENT' | 'EXAM' | 'HOLIDAY';

export interface ICreateNoticePayload {
  title: string;
  fileUrl?: string;
  content: string;
  type: NoticeType;
  isActive?: boolean;
  postedById?: string;
}

export interface IUpdateNoticePayload {
  title?: string;
  fileUrl?: string;
  content?: string;
  type?: NoticeType;
  isActive?: boolean;
  postedById?: string;
}
