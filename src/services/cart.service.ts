import {BaseApiService} from "@/src/base/BaseApiService";
import {apiClient} from "@config/api.client";
import {ENDPOINTS} from "@config/api.config";
import {Cart, CartItem} from "@/src/types";

/**
 * Cart Service - Extends BaseApiService
 */
class CartServiceClass extends BaseApiService<CartItem> {
  protected baseEndpoint = ENDPOINTS.CART.BASE;

  /**
   * Get cart with summary
   */
  async getCart(): Promise<Cart> {
    const response = await apiClient.get<{data: Cart}>(this.baseEndpoint);
    return response.data.data;
  }

  /**
   * Add item to cart
   */
  async addItem(productId: number, quantity: number): Promise<CartItem> {
    const response = await apiClient.post<{data: CartItem}>(ENDPOINTS.CART.ADD, {productId, quantity});
    return response.data.data;
  }

  /**
   * Sync cart from client
   */
  async syncCart(items: Array<{productId: number; quantity: number}>): Promise<Cart> {
    const response = await apiClient.post<{data: Cart}>(ENDPOINTS.CART.SYNC, {items});
    return response.data.data;
  }

  /**
   * Update item quantity
   */
  async updateItem(id: number, quantity: number): Promise<CartItem> {
    const response = await apiClient.put<{data: CartItem}>(ENDPOINTS.CART.UPDATE(id), {quantity});
    return response.data.data;
  }

  /**
   * Remove item
   */
  async removeItem(id: number): Promise<void> {
    await apiClient.delete(ENDPOINTS.CART.REMOVE(id));
  }

  /**
   * Clear cart
   */
  async clearCart(): Promise<void> {
    await apiClient.delete(ENDPOINTS.CART.CLEAR);
  }

  /**
   * Clear cart by restaurant
   */
  async clearByRestaurant(restaurantId: number): Promise<void> {
    await apiClient.delete(`${this.baseEndpoint}/restaurant/${restaurantId}`);
  }
}

export const CartService = new CartServiceClass();
