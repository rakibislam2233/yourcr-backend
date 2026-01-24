import { ZodError, ZodIssue } from 'zod';
import { IGenericErrorResponse } from '../shared/types/common.types';

const handleZodError = (error: ZodError): IGenericErrorResponse => {
  const statusCode = 400;
  const errorMessages = error.issues.map((issue: ZodIssue) => {
    return {
      path: issue.path[issue.path.length - 1] as string | number,
      message: issue.message,
    };
  });

  const message = errorMessages.map(issue => `${issue.path} : ${issue.message}`).join(', ');

  return {
    statusCode,
    message,
    errorMessages,
  };
};

export default handleZodError;
