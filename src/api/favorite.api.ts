import {ApiResponse} from "@/types/api.types";
import client from "./client";

export const favoriteApi = {
  getAll: (params?: any) => client.get<ApiResponse<any>>("/favorites", {params}),

  getByType: (type: "restaurant" | "product", params?: any) =>
    client.get<ApiResponse<any>>(`/favorites/${type}`, {params}),

  add: (type: "restaurant" | "product", id: number) => client.post<ApiResponse<null>>(`/favorites/${type}/${id}`),

  remove: (type: "restaurant" | "product", id: number) => client.delete<ApiResponse<null>>(`/favorites/${type}/${id}`),

  toggle: (type: "restaurant" | "product", id: number) =>
    client.post<ApiResponse<null>>(`/favorites/${type}/${id}/toggle`),

  check: (type: "restaurant" | "product", id: number) => client.get<ApiResponse<any>>(`/favorites/${type}/${id}/check`),
};
