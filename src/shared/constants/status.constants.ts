export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

export const SUCCESS_MESSAGES = {
  USER_REGISTERED: 'User registered successfully',
  USER_LOGGED_IN: 'User logged in successfully',
  USER_LOGGED_OUT: 'User logged out successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  PROFILE_FETCHED: 'Profile fetched successfully',
  USERS_FETCHED: 'Users fetched successfully',
  USER_DELETED: 'User deleted successfully',
  OTP_SENT: 'OTP sent successfully',
  OTP_VERIFIED: 'OTP verified successfully',
  OTP_RESENT: 'OTP resent successfully',
  FILE_UPLOADED: 'File uploaded successfully',
  FILES_FETCHED: 'Files fetched successfully',
  FILE_DELETED: 'File deleted successfully',
  TOKEN_REFRESHED: 'Token refreshed successfully',
} as const;

export const CACHE_KEYS = {
  USER_PROFILE: (userId: string) => `user_profile:${userId}`,
  OTP: (email: string, type: string) => `otp:${type}:${email}`,
  REFRESH_TOKEN: (token: string) => `refresh_token:${token}`,
  RATE_LIMIT: (identifier: string) => `rate_limit:${identifier}`,
} as const;