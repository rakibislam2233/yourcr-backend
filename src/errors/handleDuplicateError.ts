import { IErrorMessage, IGenericErrorResponse } from '../shared/types/common.types';

const handleDuplicateError = (error: any): IGenericErrorResponse => {
  if (error.code !== 11000 || !error.keyValue) {
    return {
      statusCode: 500,
      message: 'Unexpected duplicate error',
      errorMessages: [
        {
          path: '',
          message: 'An unexpected error occurred while checking for duplicates',
        },
      ],
    };
  }

  const field = Object.keys(error.keyValue)[0];
  const value = error.keyValue[field];
  const friendlyField = field
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();

  const errorMessages: IErrorMessage[] = [
    {
      path: field,
      message: `${friendlyField} '${value}' already exists`,
    },
  ];

  return {
    statusCode: 409,
    message: `${friendlyField} '${value}' already exists`,
    errorMessages,
  };
};

export default handleDuplicateError;
