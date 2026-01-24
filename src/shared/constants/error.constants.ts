export const ERROR_MESSAGES = {
  // Auth Errors
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_NOT_FOUND: 'User not found',
  USER_ALREADY_EXISTS: 'User already exists',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Insufficient permissions',
  TOKEN_EXPIRED: 'Token has expired',
  INVALID_TOKEN: 'Invalid token',
  ACCOUNT_DEACTIVATED: 'Account is deactivated',
  EMAIL_NOT_VERIFIED: 'Email not verified',
  
  // OTP Errors
  INVALID_OTP: 'Invalid OTP',
  OTP_EXPIRED: 'OTP has expired',
  OTP_NOT_FOUND: 'OTP not found',
  MAX_OTP_ATTEMPTS: 'Maximum OTP attempts exceeded',
  
  // Validation Errors
  VALIDATION_ERROR: 'Validation failed',
  REQUIRED_FIELD: 'Field is required',
  INVALID_EMAIL: 'Invalid email format',
  INVALID_PHONE: 'Invalid phone number',
  PASSWORD_TOO_SHORT: 'Password must be at least 6 characters',
  
  // File Upload Errors
  FILE_TOO_LARGE: 'File size exceeds limit',
  INVALID_FILE_TYPE: 'Invalid file type',
  UPLOAD_FAILED: 'File upload failed',
  FILE_NOT_FOUND: 'File not found',
  
  // Database Errors
  DATABASE_ERROR: 'Database operation failed',
  DUPLICATE_ENTRY: 'Entry already exists',
  
  // Redis Errors
  REDIS_CONNECTION_FAILED: 'Redis connection failed',
  
  // Email Errors
  EMAIL_SEND_FAILED: 'Failed to send email',
  
  // Generic Errors
  INTERNAL_SERVER_ERROR: 'Internal server error',
  BAD_REQUEST: 'Bad request',
  NOT_FOUND: 'Resource not found',
  CONFLICT: 'Resource conflict',
} as const;

export const ERROR_CODES = {
  // HTTP Status Codes
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  
  // Custom Error Codes
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  REDIS_ERROR: 'REDIS_ERROR',
  EMAIL_ERROR: 'EMAIL_ERROR',
  FILE_UPLOAD_ERROR: 'FILE_UPLOAD_ERROR',
} as const;