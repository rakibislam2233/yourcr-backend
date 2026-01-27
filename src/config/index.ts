import colors from 'colors';
import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'REDIS_HOST',
  'REDIS_PORT',
] as const;

const optionalEnvVars = [
  'JWT_RESET_PASSWORD_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'SMTP_USERNAME',
  'SMTP_PASSWORD',
] as const;

// Validate required environment variables
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  if (process.env.NODE_ENV === 'production') {
    console.error(
      colors.red(`❌ Missing required environment variables: ${missingEnvVars.join(', ')}`)
    );
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  } else {
    console.warn(
      colors.yellow(
        `⚠️  Warning: Missing required environment variables: ${missingEnvVars.join(', ')}`
      )
    );
  }
}

// Warn about missing optional variables
if (process.env.NODE_ENV === 'development') {
  const missingOptional = optionalEnvVars.filter(envVar => !process.env[envVar]);
  if (missingOptional.length > 0) {
    console.warn(
      colors.yellow(`⚠️  Missing optional environment variables: ${missingOptional.join(', ')}`)
    );
  }
}

// Export config
const config = {
  // Environment
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '8082', 10),

  // Database
  database: {
    url: process.env.DATABASE_URL!,
  },

  // JWT Authentication (For Access & Refresh Tokens)
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET!,
    refreshSecret: process.env.JWT_REFRESH_SECRET!,
    resetPasswordSecret: process.env.JWT_RESET_PASSWORD_SECRET || process.env.JWT_ACCESS_SECRET!,
    accessExpiration: process.env.JWT_ACCESS_EXPIRATION_TIME || '1d',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION_TIME || '7d',
    resetPasswordExpiration: process.env.JWT_RESET_PASSWORD_EXPIRATION_TIME || '30m',
  },

  // Auth Settings
  auth: {
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10),
    lockTime: parseInt(process.env.LOCK_TIME || '2', 10), //2 minutes
  },

  // Session Configuration (For OTP, Email Verification, Password Reset)
  session: {
    // OTP Session
    otpExpiry: parseInt(process.env.OTP_EXPIRY_MINUTES || '10', 10) * 60 * 1000, // 10 minutes in ms

    // Password Reset Session
    passwordResetExpiry:
      parseInt(process.env.PASSWORD_RESET_EXPIRY_MINUTES || '15', 10) * 60 * 1000, // 15 minutes

    // General session settings
    secret: process.env.SESSION_SECRET || process.env.JWT_ACCESS_SECRET!,
    prefix: 'sess:', // Redis key prefix for sessions
  },

  // Bcrypt
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),
  },

  // Email
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    username: process.env.SMTP_USERNAME || '',
    password: process.env.SMTP_PASSWORD || '',
    emailFrom: process.env.EMAIL_FROM || process.env.SMTP_USERNAME || '',
    secure: parseInt(process.env.SMTP_PORT || '587', 10) === 465,
  },

  // Client/Frontend
  client: {
    url: process.env.CLIENT_URL || 'http://localhost:3000',
  },

  // Backend
  backend: {
    ip: process.env.BACKEND_IP || '0.0.0.0',
    baseUrl: `http://${process.env.BACKEND_IP || 'localhost'}:${process.env.PORT || '8082'}`,
  },

  // Cloudinary
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },

  // CORS
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
      : ['http://localhost:3000', 'http://localhost:3001'],
    developmentOrigins: process.env.DEV_ALLOWED_ORIGINS
      ? process.env.DEV_ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
      : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000'],
  },

  // Redis
  redis: {
    username: process.env.REDIS_USERNAME || '',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
  },

  // Security & Rate Limiting
  security: {
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 min
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    authRateLimitMax: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '10', 10),
    encryptionKey: process.env.ENCRYPTION_KEY || '',
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
    enableFileLogging: process.env.ENABLE_FILE_LOGGING !== 'false',
  },

  // Pagination
  pagination: {
    defaultLimit: parseInt(process.env.PAGINATION_DEFAULT_LIMIT || '10', 10),
    maxLimit: parseInt(process.env.PAGINATION_MAX_LIMIT || '100', 10),
    defaultPage: parseInt(process.env.PAGINATION_DEFAULT_PAGE || '1', 10),
  },
};

// Validate critical configurations
if (config.env === 'production') {
  if (!config.jwt.accessSecret || config.jwt.accessSecret.length < 32) {
    throw new Error('JWT_ACCESS_SECRET must be at least 32 characters in production');
  }

  if (!config.jwt.refreshSecret || config.jwt.refreshSecret.length < 32) {
    throw new Error('JWT_REFRESH_SECRET must be at least 32 characters in production');
  }

  if (!config.redis.password) {
    console.warn(colors.yellow('⚠️  WARNING: Redis password not set in production!'));
  }

  if (!config.email.username || !config.email.password) {
    console.warn(colors.yellow('⚠️  WARNING: SMTP credentials not configured!'));
  }
}

export default config;
