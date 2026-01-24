export interface IPaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface IPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface IApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  meta?: IPaginationMeta;
}

export interface ITokenPayload {
  userId: string;
  email: string;
  role?: string;
}

export interface IRequestUser extends ITokenPayload {
  iat?: number;
  exp?: number;
}