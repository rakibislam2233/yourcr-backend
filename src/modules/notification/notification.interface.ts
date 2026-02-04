export type NotificationType = 'NOTICE' | 'ASSESSMENT' | 'ISSUE' | 'SYSTEM';

export interface ICreateNotificationPayload {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  relatedId?: string;
}

export interface IUpdateNotificationPayload {
  isRead?: boolean;
}
