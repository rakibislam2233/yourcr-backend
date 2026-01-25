export enum OtpType {
  EMAIL_VERIFICATION = 'email-verification',
  PASSWORD_RESET = 'password-reset',
}

export interface IOtpSession {
  email: string;
  userId: string;
  code: string;
  type: OtpType;
  ipAddress?: string;
  attempts: number;
  createdAt: Date;
}
