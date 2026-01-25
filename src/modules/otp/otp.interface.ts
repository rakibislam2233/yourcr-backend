export enum OtpType {
  EMAIL_VERIFICATION = 'email-verification',
  RESET_PASSWORD = 'reset-password',
}

export interface IOtpSession {
  email: string;
  userId: string;
  code: string;
  type: OtpType;
  attempts: number;
  createdAt: Date;
}
