export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode?: number;
  errors?: Record<string, string>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  count: number;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
