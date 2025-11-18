import {Order} from "@types/models.types";
import client from "./client";
import {ApiResponse, PaginatedResponse} from "@/types/api.types";

export const orderApi = {
  create: (data: any) => client.post<ApiResponse<Order>>("/orders", data),

  getMyOrders: (params?: any) => client.get<ApiResponse<PaginatedResponse<Order>>>("/orders", {params}),

  getById: (id: number) => client.get<ApiResponse<Order>>(`/orders/${id}`),

  cancelOrder: (id: number, reason?: string) =>
    client.delete<ApiResponse<null>>(`/orders/${id}`, {
      data: {reason},
    }),

  updateStatus: (id: number, status: string) => client.patch<ApiResponse<Order>>(`/orders/${id}/status`, {status}),

  reorder: (id: number, note?: string) => client.post<ApiResponse<Order>>(`/orders/${id}/reorder`, {note}),

  rateOrder: (id: number, rating: number, comment: string) =>
    client.post<ApiResponse<null>>(`/orders/${id}/rate`, {rating, comment}),
};
