export interface ISuccessResponse<T = any> {
  success: true;
  statusCode: number;
  message: string;
  data?: T;
  meta?: any;
}

export interface IErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  errorMessages?: IErrorMessage[];
}

export interface IErrorMessage {
  path: string;
  message: string;
}

export interface IApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  meta?: any;
  errorMessages?: IErrorMessage[];
}