export const AUTH_CACHE_KEY = {
  OTP_SESSION: (sessionId: string) => `session-otp:${sessionId}`,
  REFRESH_TOKEN: (userId: string) => `refresh-token:${userId}`,
  RESET_PASSWORD_TOKEN: (userId: string) => `reset-password-token:${userId}`,
  BLACKlISTED_TOKEN: (token: string) => `blacklisted-token:${token}`,
  FORGOT_PASSWORD_LIMIT: (userId: string) => `limit-forgot-password:${userId}`,
  RESET_PASSWORD_LIMIT: (userId: string) => `limit-reset-password:${userId}`,
  LOGIN_ATTEMPT: (email: string) => `login-attempt:${email}`,
  LOGIN_LOCK: (email: string) => `login-lock:${email}`,
  REGISTRATION_SESSION: (sessionId: string) => `registration-session:${sessionId}`,
};

export const AUTH_CACHE_TTL = {
  OTP_SESSION: 30 * 60,
  RESET_PASSWORD_TOKEN: 60 * 60, // 1 hour (3600 seconds)
  REFRESH_TOKEN: 7 * 24 * 60 * 60, // 7 days (604800 seconds)
  LOGIN_ATTEMPT: 2 * 60, // 2 minutes
  LOGIN_LOCK: 2 * 60, // 2 minutes
  OTP_RESEND_COOLDOWN: 1 * 60, // 1 minute
  REGISTRATION_SESSION: 1 * 60 * 60, // 1 hour
};
