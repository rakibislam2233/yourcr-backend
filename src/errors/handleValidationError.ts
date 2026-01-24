import mongoose from 'mongoose';
import { IErrorMessage, IGenericErrorResponse } from '../shared/types/common.types';

const handleValidationError = (error: mongoose.Error.ValidationError): IGenericErrorResponse => {
  const errorMessages: IErrorMessage[] = Object.values(error.errors).map(
    (el: mongoose.Error.ValidatorError | mongoose.Error.CastError) => {
      return {
        path: el.path,
        message: el.message,
      };
    }
  );

  const message = errorMessages.map(issue => `${issue.path} : ${issue.message}`).join(', ');

  const statusCode = 400;
  return {
    statusCode,
    message,
    errorMessages,
  };
};

export default handleValidationError;
