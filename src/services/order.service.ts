import {BaseApiService, PaginatedResponse} from "@/src/base/BaseApiService";
import {apiClient} from "@config/api.client";
import {ENDPOINTS} from "@config/api.config";
import {Order, CreateOrderRequest} from "@/src/types";

/**
 * Order Service - Extends BaseApiService
 */
class OrderServiceClass extends BaseApiService<Order> {
  protected baseEndpoint = ENDPOINTS.ORDERS.BASE;

  /**
   * Create order
   */
  async createOrder(data: CreateOrderRequest): Promise<Order> {
    const response = await apiClient.post<{data: Order}>(ENDPOINTS.ORDERS.CREATE, data);
    return response.data.data;
  }

  /**
   * Get orders with filters
   */
  async getOrders(page = 1, limit = 10, filters?: any): Promise<PaginatedResponse<Order>> {
    return this.getAll({
      page,
      limit,
      ...filters,
    });
  }

  /**
   * Get order by ID
   */
  async getOrderById(id: number): Promise<Order> {
    return this.getById(id);
  }

  /**
   * Cancel order
   */
  async cancelOrder(id: number): Promise<void> {
    await apiClient.delete(ENDPOINTS.ORDERS.CANCEL(id));
  }

  /**
   * Reorder
   */
  async reorder(id: number): Promise<Order> {
    const response = await apiClient.post<{data: Order}>(ENDPOINTS.ORDERS.REORDER(id));
    return response.data.data;
  }

  /**
   * Rate order
   */
  async rateOrder(id: number, rating: number, comment: string): Promise<void> {
    await apiClient.post(ENDPOINTS.ORDERS.RATE(id), {
      rating,
      comment,
    });
  }

  /**
   * Update order status
   */
  async updateStatus(id: number, status: string): Promise<Order> {
    return this.patch(id, {status} as any);
  }

  /**
   * Get order statistics
   */
  async getStats(): Promise<any> {
    const response = await apiClient.get<{data: any}>(`${this.baseEndpoint}/stats/summary`);
    return response.data.data;
  }
}

export const OrderService = new OrderServiceClass();
