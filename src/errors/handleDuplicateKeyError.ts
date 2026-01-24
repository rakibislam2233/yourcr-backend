import { IErrorMessage, IGenericErrorResponse } from '../shared/types/common.types';

const handleDuplicateKeyError = (error: any): IGenericErrorResponse => {
  const message = error.message || 'Duplicate key error';
  const errorMessages: IErrorMessage[] = [
    {
      path: '',
      message,
    },
  ];

  const statusCode = 409;
  return {
    statusCode,
    message,
    errorMessages,
  };
};

export default handleDuplicateKeyError;
