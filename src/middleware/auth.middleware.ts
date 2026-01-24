import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../utils/ApiError';
import { RedisService } from '../services/redis.service';
import { verifyAccessToken } from '../utils/jwt.utils';

interface IDecodedToken {
  userId: string;
  email: string;
  role?: string;
}

const AUTH_CACHE_KEY = {
  BLACKlISTED_TOKEN: (token: string) => `blacklisted_token:${token}`,
};

declare global {
  namespace Express {
    interface Request {
      user?: IDecodedToken;
    }
  }
}

const auth =
  (...requiredRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get authorization header
      const token = req.headers.authorization;

      if (!token) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Authorization header is missing');
      }
      const tokenValue = token.startsWith('Bearer ') ? token.slice(7) : token;

      const isBlacklisted = await RedisService.existsCache(AUTH_CACHE_KEY.BLACKlISTED_TOKEN(tokenValue));
      if (isBlacklisted) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'Token is blacklisted');
      }

      // Verify token and get decoded user
      const verifiedUser = verifyAccessToken(tokenValue);

      // ✅ Now verifiedUser has userId, email, role
      req.user = verifiedUser;

      // Role based authorization
      if (requiredRoles.length && verifiedUser.role && !requiredRoles.includes(verifiedUser.role)) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'Insufficient permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };

export { auth };
