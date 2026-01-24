import { NextFunction, Request, Response } from 'express';
import { redisClient } from '../../infrastructure/cache/redis.client';
import { AUTH_CACHE_KEY } from '../../modules/auth/auth.redisService';
import { IDecodedToken, jwtHelper } from '../../shared/helpers/jwtHelper';
import AppError from '../../shared/utils/AppError';

declare global {
  namespace Express {
    interface Request {
      user?: IDecodedToken; // ✅ This has userId, email, role
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
        throw AppError.unauthorized();
      }
      const tokenValue = token.startsWith('Bearer ') ? token.slice(7) : token;

      const isBlacklisted = await redisClient.exists(AUTH_CACHE_KEY.BLACKlISTED_TOKEN(tokenValue));
      if (isBlacklisted) {
        throw AppError.unauthorized();
      }

      // Verify token and get decoded user
      const verifiedUser = jwtHelper.verifyAccessToken(tokenValue);

      // ✅ Now verifiedUser has userId, email, role
      req.user = verifiedUser;

      // Role based authorization
      if (requiredRoles.length && !requiredRoles.includes(verifiedUser.role)) {
        throw AppError.forbidden();
      }

      next();
    } catch (error) {
      next(error);
    }
  };

export default auth;
