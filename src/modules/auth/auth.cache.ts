export const AUTH_CACHE_KEY = {
  OTP_SESSION: (sessionId: string) => `session-otp:${sessionId}`,
  REFRESH_TOKEN: (userId: string) => `refresh-token:${userId}`,
  RESET_PASSWORD_TOKEN: (userId: string) => `reset-password-token:${userId}`,
  BLACKlISTED_TOKEN: (token: string) => `blacklisted-token:${token}`,
  FORGOT_PASSWORD_LIMIT: (userId: string) => `limit-forgot-password:${userId}`,
  RESET_PASSWORD_LIMIT: (userId: string) => `limit-reset-password:${userId}`,
};

export const AUTH_CACHE_TTL = {
  OTP_SESSION: 30 * 60 * 1000, // 30 minutes
  RESET_PASSWORD_TOKEN: 60 * 60 * 1000, // 1hour
  REFRESH_TOKEN: 7 * 24 * 60 * 60 * 1000, // 7day
};
