import {apiClient} from "../config/api.client";
import {ENDPOINTS} from "../config/api.config";
import {ApiResponse, Cart} from "../types";

export class CartService {
  static async getCart() {
    const response = await apiClient.get<ApiResponse<Cart>>(ENDPOINTS.CART.BASE);
    return response.data.data;
  }

  static async addItem(productId: number, quantity: number) {
    const response = await apiClient.post<ApiResponse<any>>(ENDPOINTS.CART.ADD, {
      productId,
      quantity,
    });
    return response.data.data;
  }

  static async syncCart(items: {productId: number; quantity: number}[]) {
    const response = await apiClient.post<ApiResponse<any>>(ENDPOINTS.CART.SYNC, {items});
    return response.data.data;
  }

  static async updateItem(id: number, quantity: number) {
    const response = await apiClient.put<ApiResponse<any>>(ENDPOINTS.CART.UPDATE(id), {quantity});
    return response.data.data;
  }

  static async removeItem(id: number) {
    return await apiClient.delete(ENDPOINTS.CART.REMOVE(id));
  }

  static async clearCart() {
    return await apiClient.delete(ENDPOINTS.CART.CLEAR);
  }
}
