import {ApiResponse, PaginatedResponse} from "@types/api.types";
import {Product} from "@types/models.types";
import client from "./client";

export const productApi = {
  getAll: (params?: any) => client.get<ApiResponse<PaginatedResponse<Product>>>("/products", {params}),

  getDiscounted: (params?: any) =>
    client.get<ApiResponse<PaginatedResponse<Product>>>("/products/discounted", {params}),

  getById: (id: number) => client.get<ApiResponse<Product>>(`/products/${id}`),

  search: (q: string, params?: any) =>
    client.get<ApiResponse<PaginatedResponse<Product>>>("/products/search", {
      params: {q, ...params},
    }),
};
