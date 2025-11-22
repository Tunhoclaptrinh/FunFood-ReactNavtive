import {AxiosError, AxiosResponse} from "axios";
import {apiClient} from "../config/api.client";

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
 * Enhanced Base API Service với full backend feature support
 *
 * Features:
 * - Pagination (_page, _limit)
 * - Sorting (_sort, _order)
 * - Filtering (field_gte, field_lte, field_ne, field_like, field_in)
 * - Search (q)
 * - Relationships (_embed, _expand)
 * - CRUD operations
 * - Batch operations
 *
 * Usage:
 * ```typescript
 * class UserService extends BaseApiService<User> {
 *   protected baseEndpoint = "/users";
 * }
 *
 * const userService = new UserService();
 *
 * // Get all with pagination
 * await userService.getAll({ page: 1, limit: 10 });
 *
 * // Search
 * await userService.search("john");
 *
 * // Filter
 * await userService.filter({ role: "admin", isActive: true });
 *
 * // Get with relationships
 * await userService.getWithRelations(1, { embed: ["orders"] });
 * ```
 */
export abstract class BaseApiService<T> {
  protected abstract baseEndpoint: string;

  /**
   * Get single resource by ID
   */
  async getById(id: string | number, params?: {_embed?: string; _expand?: string}): Promise<T> {
    const response = await apiClient.get<ApiResponse<T>>(`${this.baseEndpoint}/${id}`, params);
    return this.extractData(response);
  }

  /**
   * Get all resources với full query support
   * Supports: pagination, sorting, filtering, search, relationships
   */
  async getAll(params?: PaginationParams): Promise<PaginatedResponse<T>> {
    const normalizedParams = this.normalizeParams(params);
    const response = await apiClient.get<PaginatedResponse<T>>(this.baseEndpoint, normalizedParams);
    return response.data;
  }

  /**
   * Search resources with full-text search
   */
  async search(query: string, params?: PaginationParams): Promise<PaginatedResponse<T>> {
    const normalizedParams = this.normalizeParams({
      ...params,
      q: query,
    });
    const response = await apiClient.get<PaginatedResponse<T>>(`${this.baseEndpoint}/search`, normalizedParams);
    return response.data;
  }

  /**
   * Advanced filtering với operators
   *
   * Operators:
   * - field_gte: greater than or equal (price_gte: 50000)
   * - field_lte: less than or equal (rating_lte: 4.5)
   * - field_ne: not equal (discount_ne: 0)
   * - field_like: contains (name_like: "pizza")
   * - field_in: in list (id_in: "1,2,3")
   *
   * Examples:
   * ```typescript
   * // Products with price >= 50000 and discount > 0
   * await productService.filter({ price_gte: 50000, discount_ne: 0 });
   *
   * // Restaurants with rating >= 4.5 and open now
   * await restaurantService.filter({ rating_gte: 4.5, isOpen: true });
   * ```
   */
  async filter(filters: Record<string, any>, params?: PaginationParams): Promise<PaginatedResponse<T>> {
    const normalizedParams = this.normalizeParams({
      ...params,
      ...filters,
    });
    const response = await apiClient.get<PaginatedResponse<T>>(this.baseEndpoint, normalizedParams);
    return response.data;
  }

  /**
   * Get with relationships
   *
   * - _embed: nhúng related data (VD: products, reviews)
   * - _expand: mở rộng foreign keys (VD: restaurant, category)
   *
   * Examples:
   * ```typescript
   * // Get restaurant with products and reviews
   * await restaurantService.getWithRelations(1, {
   *   embed: ["products", "reviews"],
   *   expand: ["category"]
   * });
   * ```
   */
  async getWithRelations(
    id: string | number,
    options: {
      embed?: string | string[];
      expand?: string | string[];
    }
  ): Promise<T> {
    const params: any = {};
    if (options.embed) {
      params._embed = Array.isArray(options.embed) ? options.embed.join(",") : options.embed;
    }
    if (options.expand) {
      params._expand = Array.isArray(options.expand) ? options.expand.join(",") : options.expand;
    }
    return this.getById(id, params);
  }

  /**
   * Create new resource
   */
  async create(data: Partial<T>): Promise<T> {
    const response = await apiClient.post<ApiResponse<T>>(this.baseEndpoint, data);
    return this.extractData(response);
  }

  /**
   * Update resource (full update)
   */
  async update(id: string | number, data: Partial<T>): Promise<T> {
    const response = await apiClient.put<ApiResponse<T>>(`${this.baseEndpoint}/${id}`, data);
    return this.extractData(response);
  }

  /**
   * Partial update resource
   */
  async patch(id: string | number, data: Partial<T>): Promise<T> {
    const response = await apiClient.patch<ApiResponse<T>>(`${this.baseEndpoint}/${id}`, data);
    return this.extractData(response);
  }

  /**
   * Delete resource
   */
  async delete(id: string | number): Promise<void> {
    await apiClient.delete(`${this.baseEndpoint}/${id}`);
  }

  /**
   * Batch delete
   */
  async batchDelete(ids: (string | number)[]): Promise<void> {
    await Promise.all(ids.map((id) => this.delete(id)));
  }

  /**
   * Batch create
   */
  async batchCreate(items: Partial<T>[]): Promise<T[]> {
    const promises = items.map((item) => this.create(item));
    return Promise.all(promises);
  }

  /**
   * Batch update
   */
  async batchUpdate(updates: Array<{id: string | number; data: Partial<T>}>): Promise<T[]> {
    const promises = updates.map(({id, data}) => this.update(id, data));
    return Promise.all(promises);
  }

  /**
   * Check if resource exists
   */
  async exists(id: string | number): Promise<boolean> {
    try {
      await this.getById(id);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get count of resources matching filters
   */
  async count(params?: PaginationParams): Promise<number> {
    const response = await this.getAll({...params, limit: 1});
    return response.pagination?.total || 0;
  }

  /**
   * Normalize parameters to backend API format
   * Converts: page → _page, limit → _limit, etc.
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

    // Copy all other parameters as-is (for filtering, search, relationships)
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
   * Extract data from API response
   */
  protected extractData<R>(response: AxiosResponse<ApiResponse<R>>): R {
    if (!response.data.success) {
      throw new Error(response.data.message || "API request failed");
    }
    if (!response.data.data) {
      throw new Error("No data in response");
    }
    return response.data.data;
  }

  /**
   * Handle API error
   */
  protected handleError(error: AxiosError): never {
    const message = (error.response?.data as any)?.message || error.message;
    throw new Error(message);
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
