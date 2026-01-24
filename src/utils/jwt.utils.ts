import jwt from 'jsonwebtoken';
import config from '../config';

interface IJwtPayload {
  userId: string;
  email: string;
  role?: string;
}

// Generate access token
export const generateAccessToken = (payload: IJwtPayload): string => {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiration,
  });
};

// Generate refresh token
export const generateRefreshToken = (payload: IJwtPayload): string => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiration,
  });
};

// Verify access token
export const verifyAccessToken = (token: string): IJwtPayload => {
  return jwt.verify(token, config.jwt.accessSecret) as IJwtPayload;
};

// Verify refresh token
export const verifyRefreshToken = (token: string): IJwtPayload => {
  return jwt.verify(token, config.jwt.refreshSecret) as IJwtPayload;
};

// Decode token without verification
export const decodeToken = (token: string): IJwtPayload | null => {
  try {
    return jwt.decode(token) as IJwtPayload;
  } catch {
    return null;
  }
};