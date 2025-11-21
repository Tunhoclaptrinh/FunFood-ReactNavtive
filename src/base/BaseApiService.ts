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
 * Base API Service - Provides generic CRUD operations for any resource
 * Usage: class UserService extends BaseApiService<User> { }
 */
export abstract class BaseApiService<T> {
  protected abstract baseEndpoint: string;

  /**
   * Get single resource by ID
   */
  async getById(id: string | number): Promise<T> {
    const response = await apiClient.get<ApiResponse<T>>(`${this.baseEndpoint}/${id}`);
    return this.extractData(response);
  }

  /**
   * Get all resources with pagination and filtering
   */
  async getAll(params?: PaginationParams): Promise<PaginatedResponse<T>> {
    const normalizedParams = this.normalizeParams(params);
    const response = await apiClient.get<PaginatedResponse<T>>(this.baseEndpoint, {params: normalizedParams});
    return response.data;
  }

  /**
   * Search resources
   */
  async search(query: string, params?: PaginationParams): Promise<PaginatedResponse<T>> {
    const normalizedParams = this.normalizeParams({
      ...params,
      q: query,
    });
    const response = await apiClient.get<PaginatedResponse<T>>(`${this.baseEndpoint}/search`, {
      params: normalizedParams,
    });
    return response.data;
  }

  /**
   * Create new resource
   */
  async create(data: Partial<T>): Promise<T> {
    const response = await apiClient.post<ApiResponse<T>>(this.baseEndpoint, data);
    return this.extractData(response);
  }

  /**
   * Update resource
   */
  async update(id: string | number, data: Partial<T>): Promise<T> {
    const response = await apiClient.put<ApiResponse<T>>(`${this.baseEndpoint}/${id}`, data);
    return this.extractData(response);
  }

  /**
   * Delete resource
   */
  async delete(id: string | number): Promise<void> {
    await apiClient.delete(`${this.baseEndpoint}/${id}`);
  }

  /**
   * Batch delete resources
   */
  async batchDelete(ids: (string | number)[]): Promise<void> {
    await Promise.all(ids.map((id) => this.delete(id)));
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
   * Get count of resources
   */
  async count(params?: PaginationParams): Promise<number> {
    const response = await this.getAll({...params, limit: 1});
    return response.pagination?.total || 0;
  }

  /**
   * Normalize pagination parameters to API format
   */
  protected normalizeParams(params?: PaginationParams): Record<string, any> {
    const normalized: Record<string, any> = {};

    if (!params) return normalized;

    if (params.page) normalized._page = params.page;
    if (params.limit) normalized._limit = params.limit;
    if (params.sort) normalized._sort = params.sort;
    if (params.order) normalized._order = params.order;

    // Copy all other parameters as-is (for filtering)
    Object.keys(params).forEach((key) => {
      if (!["page", "limit", "sort", "order"].includes(key)) {
        normalized[key] = params[key];
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
}
