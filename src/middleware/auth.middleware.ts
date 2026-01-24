import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

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
        throw ApiError(StatusCodes.UNAUTHORIZED, 'Authorization header is missing');
      }
      const tokenValue = token.startsWith('Bearer ') ? token.slice(7) : token;

      const isBlacklisted = await redisClient.exists(AUTH_CACHE_KEY.BLACKlISTED_TOKEN(tokenValue));
      if (isBlacklisted) {
        throw ApiError(StatusCodes.UNAUTHORIZED, 'Token is blacklisted');
      }

      // Verify token and get decoded user
      const verifiedUser = jwtHelper.verifyAccessToken(tokenValue);

      // ✅ Now verifiedUser has userId, email, role
      req.user = verifiedUser;

      // Role based authorization
      if (requiredRoles.length && !requiredRoles.includes(verifiedUser.role)) {
        throw ApiError.forbidden();
      }

      next();
    } catch (error) {
      next(error);
    }
  };

export default auth;
