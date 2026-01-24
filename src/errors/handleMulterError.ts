import { MulterError } from 'multer';
import { IErrorMessage, IGenericErrorResponse } from '../shared/types/common.types';

const handleMulterError = (error: MulterError): IGenericErrorResponse => {
  const errorMessages: IErrorMessage[] = [
    {
      path: error.field || 'file',
      message: error.message,
    },
  ];

  return {
    statusCode: 400,
    message: `Upload Error: ${error.message}`,
    errorMessages,
  };
};

export default handleMulterError;
