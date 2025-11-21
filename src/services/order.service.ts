import {ENDPOINTS} from "../config/api.config";
import {ApiResponse, CreateOrderRequest, Order, PaginatedResponse} from "../types";
import {apiClient} from "../config/api.client";

export class OrderService {
  static async createOrder(data: CreateOrderRequest) {
    const response = await apiClient.post<ApiResponse<Order>>(ENDPOINTS.ORDERS.CREATE, data);
    return response.data.data;
  }

  static async getOrders(page = 1, limit = 10, filters?: any) {
    const response = await apiClient.get<PaginatedResponse<Order>>(ENDPOINTS.ORDERS.BASE, {
      _page: page,
      _limit: limit,
      ...filters,
    });
    return response.data;
  }

  static async getOrderById(id: number) {
    const response = await apiClient.get<ApiResponse<Order>>(ENDPOINTS.ORDERS.GET_ONE(id));
    return response.data.data;
  }

  static async cancelOrder(id: number) {
    return await apiClient.delete(ENDPOINTS.ORDERS.CANCEL(id));
  }

  static async reorder(id: number) {
    const response = await apiClient.post<ApiResponse<Order>>(ENDPOINTS.ORDERS.REORDER(id));
    return response.data.data;
  }

  static async rateOrder(id: number, rating: number, comment: string) {
    const response = await apiClient.post(ENDPOINTS.ORDERS.RATE(id), {
      rating,
      comment,
    });
    return response.data;
  }
}
