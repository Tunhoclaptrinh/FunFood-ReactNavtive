// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  count?: number;
  statusCode?: number;
  errors?: Record<string, string>;
}

export interface PaginatedResponse<T> {
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

export interface QueryOptions {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
  q?: string;
  filter?: Record<string, any>;
}

export interface FilterState {
  page: number;
  limit: number;
  sort?: string;
  order?: "asc" | "desc";
  searchQuery?: string;
  filters: Record<string, any>;
}
