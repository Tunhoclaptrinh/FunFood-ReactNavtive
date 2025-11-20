import {ApiResponse, PaginatedResponse} from "@types/api.types";
import {Restaurant, Product} from "@types/models.types";
import client from "./client";

export const restaurantApi = {
  // Get all restaurants
  getAll: (params?: any) => client.get<ApiResponse<PaginatedResponse<Restaurant>>>("/restaurants", {params}),

  // Get nearby restaurants (GPS)
  getNearby: (latitude: number, longitude: number, radius: number = 5, params?: any) =>
    client.get<ApiResponse<PaginatedResponse<Restaurant>>>("/restaurants/nearby", {
      params: {latitude, longitude, radius, ...params},
    }),

  // Search restaurants
  search: (q: string, params?: any) =>
    client.get<ApiResponse<PaginatedResponse<Restaurant>>>("/restaurants/search", {
      params: {q, ...params},
    }),

  // Get restaurant detail
  getById: (id: number, params?: any) => client.get<ApiResponse<Restaurant>>(`/restaurants/${id}`, {params}),

  // Get restaurant menu (products)
  getMenu: (restaurantId: number, params?: any) =>
    client.get<ApiResponse<PaginatedResponse<Product>>>(`/restaurants/${restaurantId}/products`, {
      params,
    }),

  // Admin: Create restaurant
  create: (data: any) => client.post<ApiResponse<Restaurant>>("/restaurants", data),

  // Admin: Update restaurant
  update: (id: number, data: any) => client.put<ApiResponse<Restaurant>>(`/restaurants/${id}`, data),

  // Admin: Delete restaurant
  delete: (id: number) => client.delete<ApiResponse<null>>(`/restaurants/${id}`),
};
