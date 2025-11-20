import {apiClient} from "./api.client";
import {ENDPOINTS} from "../config/api.config";
import {ApiResponse, PaginatedResponse, Product} from "../types";

export class ProductService {
  static async getAll(page = 1, limit = 20, filters?: any) {
    const response = await apiClient.get<PaginatedResponse<Product>>(ENDPOINTS.PRODUCTS.BASE, {
      _page: page,
      _limit: limit,
      ...filters,
    });
    return response.data;
  }

  static async getById(id: number) {
    const response = await apiClient.get<ApiResponse<Product>>(ENDPOINTS.PRODUCTS.GET_ONE(id));
    return response.data.data;
  }

  static async search(query: string, page = 1, limit = 20) {
    const response = await apiClient.get<PaginatedResponse<Product>>(ENDPOINTS.PRODUCTS.SEARCH, {
      q: query,
      _page: page,
      _limit: limit,
    });
    return response.data;
  }

  static async getDiscounted(page = 1, limit = 20) {
    const response = await apiClient.get<PaginatedResponse<Product>>(ENDPOINTS.PRODUCTS.DISCOUNTED, {
      _page: page,
      _limit: limit,
    });
    return response.data;
  }
}
