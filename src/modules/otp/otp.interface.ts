export enum OtpType {
  VERIFY_ACCOUNT = 'verify-account',
  FORGOT_PASSWORD = 'forgot-password',
  TWO_FACTOR_AUTHENTICATION = '2fa',
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
