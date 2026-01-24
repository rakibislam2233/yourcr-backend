import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import { MulterError } from 'multer';
import { ZodError } from 'zod';
import { config } from '../../config';
import AppError from '../../shared/utils/AppError';
import handleCastError from '../errors/handleCastError';
import handleDuplicateError from '../errors/handleDuplicateError';
import handleMulterError from '../errors/handleMulterError';
import handleValidationError from '../errors/handleValidationError';
import handleZodError from '../errors/handleZodError';
import { errorLogger } from './logger.middleware';

const globalErrorHandler: ErrorRequestHandler = (
  error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Something went wrong !';

  // Handle specific error types and extract unique messages
  if (error instanceof ZodError) {
    const simplifiedError = handleZodError(error);
    statusCode = simplifiedError.statusCode;
    // Combine all zod validation messages into one string
    message = simplifiedError.errorMessages.map((msg) => msg.message).join('. ');
  } else if (error?.name === 'ValidationError') {
    const simplifiedError = handleValidationError(error);
    statusCode = simplifiedError.statusCode;
    // Combine all mongoose validation messages into one string
    message = simplifiedError.errorMessages.map((msg) => msg.message).join('. ');
  } else if (error?.name === 'CastError') {
    const simplifiedError = handleCastError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
  } else if (
    error.name === 'DuplicateError' ||
    (error.name === 'MongoServerError' && error.code === 11000)
  ) {
    const simplifiedError = handleDuplicateError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
  } else if (error.name === 'MongoServerError') {
    if (error.code === 121) {
      statusCode = 400;
      message = 'Document validation failed';
    } else {
      statusCode = 500;
      message = error.message || 'Database error';
    }
  } else if (error instanceof MulterError) {
    const simplifiedError = handleMulterError(error);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
  } else if (error instanceof SyntaxError && error.message.includes('JSON')) {
    statusCode = 400;
    message = 'Invalid JSON format';
  } else if (error.name === 'MongoNetworkError' || error.message?.includes('ECONNREFUSED')) {
    statusCode = 503;
    message = 'Database connection failed';
  } else if (error.message?.includes('timeout') || error.name === 'TimeoutError') {
    statusCode = 504;
    message = 'Request timed out';
  } else if (error instanceof AppError) {
    statusCode = error.statusCode;
    if (error.errors && error.errors.length > 0) {
      // If there are detailed errors (like validation), join them
      message = error.errors.map((err) => err.message).join('. ');
    } else {
      message = error.message;
    }
  } else if (error instanceof Error) {
    message = error.message;
  }

  // Log error (with stack for dev)
  if (config.env === 'development') {
    console.log('🚨 Error Handler:', {
      statusCode,
      message,
      stack: error?.stack,
    });
  } else {
    errorLogger.error('🚨 Error Handler:', {
      statusCode,
      message,
    });
  }

  // Final cleaned up response
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
};

export default globalErrorHandler;
