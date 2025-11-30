// src/base/BaseApiService.ts
import {apiClient, ApiError} from "../config/api.client";

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
  [key: string]: any;
}

export interface PaginatedResponse<T> {
  success: boolean;
  count: number;
  data: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  statusCode?: number;
  errors?: Record<string, string>;
}

/**
 * Enhanced Base API Service với automatic error handling
 *
 * Features:
 * - Automatic error handling (no need try-catch in UI)
 * - Pagination, sorting, filtering
 * - Search with debounce support
 * - Relationships (_embed, _expand)
 * - CRUD operations
 * - Batch operations
 *
 * Error Handling:
 * - All errors are caught and handled automatically
 * - User-friendly error messages are shown via Alert
 * - Errors are logged in development mode
 * - Methods return null/empty array on error instead of throwing
 *
 * Usage:
 * ```typescript
 * class UserService extends BaseApiService<User> {
 *   protected baseEndpoint = "/users";
 * }
 *
 * // In component - no try-catch needed!
 * const users = await userService.getAll({ page: 1, limit: 10 });
 * if (users) {
 *   // Handle success
 * }
 * ```
 */
export abstract class BaseApiService<T> {
  protected abstract baseEndpoint: string;

  /**
   * Safe wrapper for API calls - handles errors automatically
   */
  protected async safeCall<R>(
    apiCall: () => Promise<R>,
    defaultValue: R,
    options?: {
      silent?: boolean; // Don't show error alert
      logError?: boolean; // Log error to console
    }
  ): Promise<R> {
    try {
      return await apiCall();
    } catch (error) {
      // Error is already handled by apiClient
      // Just log if needed and return default value
      if (options?.logError || __DEV__) {
        console.error(`BaseApiService Error [${this.baseEndpoint}]:`, error);
      }
      return defaultValue;
    }
  }

  /**
   * Get single resource by ID
   * Returns null if not found or error occurs
   */
  async getById(id: string | number, params?: {_embed?: string; _expand?: string}): Promise<T | null> {
    return this.safeCall(async () => {
      const data = await apiClient.get<T>(`${this.baseEndpoint}/${id}`, params);
      return data;
    }, null);
  }

  /**
   * Get all resources with full query support
   * Returns paginated response or empty array on error
   */
  async getAll(params?: PaginationParams): Promise<PaginatedResponse<T>> {
    const emptyResponse: PaginatedResponse<T> = {
      success: false,
      count: 0,
      data: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    };

    return this.safeCall(async () => {
      const normalizedParams = this.normalizeParams(params);
      const response = await apiClient.get<PaginatedResponse<T>>(this.baseEndpoint, normalizedParams);
      return response;
    }, emptyResponse);
  }

  /**
   * Search resources with full-text search
   */
  async search(query: string, params?: PaginationParams): Promise<PaginatedResponse<T>> {
    const emptyResponse: PaginatedResponse<T> = {
      success: false,
      count: 0,
      data: [],
    };

    return this.safeCall(async () => {
      const normalizedParams = this.normalizeParams({
        ...params,
        q: query,
      });
      const response = await apiClient.get<PaginatedResponse<T>>(`${this.baseEndpoint}/search`, normalizedParams);
      return response;
    }, emptyResponse);
  }

  /**
   * Advanced filtering with operators
   */
  async filter(filters: Record<string, any>, params?: PaginationParams): Promise<PaginatedResponse<T>> {
    const emptyResponse: PaginatedResponse<T> = {
      success: false,
      count: 0,
      data: [],
    };

    return this.safeCall(async () => {
      const normalizedParams = this.normalizeParams({
        ...params,
        ...filters,
      });
      const response = await apiClient.get<PaginatedResponse<T>>(this.baseEndpoint, normalizedParams);
      return response;
    }, emptyResponse);
  }

  /**
   * Get with relationships
   */
  async getWithRelations(
    id: string | number,
    options: {
      embed?: string | string[];
      expand?: string | string[];
    }
  ): Promise<T | null> {
    return this.safeCall(async () => {
      const params: any = {};
      if (options.embed) {
        params._embed = Array.isArray(options.embed) ? options.embed.join(",") : options.embed;
      }
      if (options.expand) {
        params._expand = Array.isArray(options.expand) ? options.expand.join(",") : options.expand;
      }
      return this.getById(id, params);
    }, null);
  }

  /**
   * Create new resource
   * Returns created resource or null on error
   */
  async create(data: Partial<T>): Promise<T | null> {
    return this.safeCall(async () => {
      const result = await apiClient.post<T>(this.baseEndpoint, data);
      return result;
    }, null);
  }

  /**
   * Update resource (full update)
   */
  async update(id: string | number, data: Partial<T>): Promise<T | null> {
    return this.safeCall(async () => {
      const result = await apiClient.put<T>(`${this.baseEndpoint}/${id}`, data);
      return result;
    }, null);
  }

  /**
   * Partial update resource
   */
  async patch(id: string | number, data: Partial<T>): Promise<T | null> {
    return this.safeCall(async () => {
      const result = await apiClient.patch<T>(`${this.baseEndpoint}/${id}`, data);
      return result;
    }, null);
  }

  /**
   * Delete resource
   * Returns true on success, false on error
   */
  async delete(id: string | number): Promise<boolean> {
    return this.safeCall(async () => {
      await apiClient.delete(`${this.baseEndpoint}/${id}`);
      return true;
    }, false);
  }

  /**
   * Batch delete
   * Returns number of successfully deleted items
   */
  async batchDelete(ids: (string | number)[]): Promise<number> {
    return this.safeCall(async () => {
      const results = await Promise.allSettled(ids.map((id) => this.delete(id)));
      return results.filter((r) => r.status === "fulfilled" && r.value).length;
    }, 0);
  }

  /**
   * Batch create
   * Returns array of created items (empty on complete failure)
   */
  async batchCreate(items: Partial<T>[]): Promise<T[]> {
    return this.safeCall(async () => {
      const results = await Promise.allSettled(items.map((item) => this.create(item)));
      return results.filter((r) => r.status === "fulfilled" && r.value).map((r: any) => r.value);
    }, []);
  }

  /**
   * Batch update
   * Returns array of updated items (empty on complete failure)
   */
  async batchUpdate(updates: Array<{id: string | number; data: Partial<T>}>): Promise<T[]> {
    return this.safeCall(async () => {
      const results = await Promise.allSettled(updates.map(({id, data}) => this.update(id, data)));
      return results.filter((r) => r.status === "fulfilled" && r.value).map((r: any) => r.value);
    }, []);
  }

  /**
   * Check if resource exists
   */
  async exists(id: string | number): Promise<boolean> {
    return this.safeCall(
      async () => {
        const result = await this.getById(id);
        return result !== null;
      },
      false,
      {silent: true} // Don't show error for exists check
    );
  }

  /**
   * Get count of resources matching filters
   */
  async count(params?: PaginationParams): Promise<number> {
    return this.safeCall(
      async () => {
        const response = await this.getAll({...params, limit: 1});
        return response.pagination?.total || 0;
      },
      0,
      {silent: true}
    );
  }

  /**
   * Normalize parameters to backend API format
   */
  protected normalizeParams(params?: PaginationParams): Record<string, any> {
    const normalized: Record<string, any> = {};

    if (!params) return normalized;

    // Pagination
    if (params.page !== undefined) normalized._page = params.page;
    if (params.limit !== undefined) normalized._limit = params.limit;

    // Sorting
    if (params.sort) normalized._sort = params.sort;
    if (params.order) normalized._order = params.order;

    // Copy all other parameters
    Object.keys(params).forEach((key) => {
      if (!["page", "limit", "sort", "order"].includes(key)) {
        const value = params[key];
        if (value !== undefined && value !== null) {
          normalized[key] = value;
        }
      }
    });

    return normalized;
  }

  /**
   * Build query string for complex filters
   */
  protected buildQueryString(filters: Record<string, any>): string {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
    return params.toString();
  }
}
