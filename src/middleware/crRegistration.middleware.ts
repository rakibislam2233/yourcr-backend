import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status-codes';
import { database } from '../config/database.config';
import ApiError from '../utils/ApiError';

export const requireCRRegistrationCompletion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId, role } = req.user;

  if (!userId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'User not authenticated');
  }

  // Only check for students who have verified their email
  if (role === 'STUDENT') {
    const user = await database.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    // ✅ BYPASS: If student is already enrolled in a batch (added by CR), they skip registration
    if (user.currentBatchId) {
      return next();
    }

    // If user has verified email but hasn't submitted CR details,
    // they need to complete CR registration first
    if (user.isEmailVerified && !user.isRegistrationComplete) {
      throw new ApiError(httpStatus.FORBIDDEN, 'Please complete CR registration first', [
        { path: 'crRegistration', message: 'CR registration required' },
      ]);
    }

    // If user has submitted CR details but not approved yet,
    // they cannot access regular student features
    if (user.isRegistrationComplete && !user.isCr) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        'CR registration is pending approval. Please wait for admin approval.',
        [{ path: 'crRegistration', message: 'CR registration pending approval' }]
      );
    }
  }

  next();
};
