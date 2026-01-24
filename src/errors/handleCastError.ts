import mongoose from 'mongoose';
import { IErrorMessage, IGenericErrorResponse } from '../shared/types/common.types';

const handleCastError = (error: mongoose.Error.CastError): IGenericErrorResponse => {
  const errorMessages: IErrorMessage[] = [
    {
      path: error.path,
      message: 'Invalid Id',
    },
  ];
  const statusCode = 400;
  return {
    statusCode,
    message: `Invalid Id: ${error.path}`,
    errorMessages,
  };
};

export default handleCastError;
