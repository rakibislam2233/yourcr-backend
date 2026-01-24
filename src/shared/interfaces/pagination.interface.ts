export interface IPaginationRequest {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface IPaginationResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface IPaginationQuery {
  skip: number;
  take: number;
  orderBy?: Record<string, 'asc' | 'desc'>;
}