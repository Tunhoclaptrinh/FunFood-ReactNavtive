/**
 * Shipper Service - FIXED
 * Với proper handling của undefined values
 */

import {ENDPOINTS} from "../config/api.config";
import {apiClient} from "../config/api.client";
import {PaginatedResponse} from "../types";

export interface ShipperOrder {
  id: number;
  restaurantName: string;
  restaurantAddress: string;
  customerName: string;
  deliveryAddress: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  total: number;
  items: any[];
  status: "preparing" | "delivering" | "delivered";
  distance: number;
  estimatedTime: number;
  deliveryFee: number;
}

export interface ShipperStats {
  totalOrders: number;
  deliveringOrders: number;
  deliveredToday: number;
  totalEarnings: number;
  todayEarnings: number;
  averageDeliveryTime: number;
  averageRating: number;
  thisMonth?: {
    delivered: number;
    total: number;
  };
  today?: {
    delivered: number;
    total: number;
  };
  earnings?: {
    today: number;
    thisMonth: number;
    total: number;
  };
}

/**
 * Transform API response to ShipperStats format
 * Handles missing/undefined fields
 */
function transformStats(apiData: any): ShipperStats {
  const today = apiData?.today || {};
  const thisMonth = apiData?.thisMonth || {};
  const earnings = apiData?.earnings || {};
  const byStatus = apiData?.byStatus || {};

  return {
    // Orders count
    totalOrders: apiData?.total || 0,
    deliveredToday: today?.delivered || 0,
    deliveringOrders: byStatus?.delivering || 0,

    // Earnings
    todayEarnings: earnings?.today || 0,
    totalEarnings: earnings?.total || 0,

    // Metrics - dengan default values
    averageDeliveryTime: apiData?.avgDeliveryTime || 30, // default 30 min
    averageRating: apiData?.avgRating || 4.5, // default 4.5 stars

    // Additional data
    today,
    thisMonth,
    earnings,
  };
}

export class ShipperService {
  /**
   * Lấy đơn hàng available (chưa nhận)
   */
  static async getAvailableOrders(page = 1, limit = 10): Promise<PaginatedResponse<ShipperOrder>> {
    try {
      const response = await apiClient.get<PaginatedResponse<ShipperOrder>>("/shipper/orders/available", {
        _page: page,
        _limit: limit,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching available orders:", error);
      throw error;
    }
  }

  /**
   * Nhận đơn hàng (assign to self)
   */
  static async acceptOrder(orderId: number): Promise<ShipperOrder> {
    try {
      const response = await apiClient.post<{data: ShipperOrder}>(`/shipper/orders/${orderId}/accept`);
      return response.data.data;
    } catch (error) {
      console.error("Error accepting order:", error);
      throw error;
    }
  }

  /**
   * Lấy đơn đang giao
   */
  static async getDeliveries(page = 1, limit = 10): Promise<PaginatedResponse<ShipperOrder>> {
    try {
      const response = await apiClient.get<PaginatedResponse<ShipperOrder>>("/shipper/orders/my-deliveries", {
        _page: page,
        _limit: limit,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching deliveries:", error);
      throw error;
    }
  }

  /**
   * Cập nhật status giao hàng
   */
  static async updateDeliveryStatus(orderId: number, status: "delivering" | "delivered"): Promise<ShipperOrder> {
    try {
      const response = await apiClient.patch<{data: ShipperOrder}>(`/shipper/orders/${orderId}/status`, {status});
      return response.data.data;
    } catch (error) {
      console.error("Error updating delivery status:", error);
      throw error;
    }
  }

  /**
   * Lấy lịch sử giao hàng
   */
  static async getDeliveryHistory(page = 1, limit = 10): Promise<PaginatedResponse<ShipperOrder>> {
    try {
      const response = await apiClient.get<PaginatedResponse<ShipperOrder>>("/shipper/orders/history", {
        _page: page,
        _limit: limit,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching delivery history:", error);
      throw error;
    }
  }

  /**
   * Lấy thống kê shipper
   * ✅ FIXED: Thêm error handling & default values
   */
  static async getStats(): Promise<ShipperStats> {
    try {
      const response = await apiClient.get<{data: any}>("/shipper/stats");

      // Transform API response với default values
      const stats = transformStats(response.data.data);

      console.log("Shipper Stats:", stats);

      return stats;
    } catch (error) {
      console.error("Error fetching shipper stats:", error);

      // Return default stats nếu API fail
      return {
        totalOrders: 0,
        deliveringOrders: 0,
        deliveredToday: 0,
        totalEarnings: 0,
        todayEarnings: 0,
        averageDeliveryTime: 30,
        averageRating: 4.5,
      };
    }
  }

  /**
   * Lấy chi tiết đơn hàng
   */
  static async getOrderDetail(orderId: number): Promise<ShipperOrder> {
    try {
      const response = await apiClient.get<{data: ShipperOrder}>(`/orders/${orderId}`);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching order detail:", error);
      throw error;
    }
  }
}
