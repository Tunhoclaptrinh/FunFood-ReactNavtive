// src/services/cart.service.ts
import {BaseApiService} from "@/src/base/BaseApiService";
import {apiClient} from "@config/api.client";
import {ENDPOINTS} from "@config/api.config";
import {Cart, CartItem} from "@/src/types";

/**
 * Enhanced Cart Service với automatic error handling
 *
 * Features:
 * - Tất cả methods không cần try-catch
 * - Trả về null/empty data khi có lỗi
 * - Tự động hiển thị error alerts
 * - Hỗ trợ batch operations
 *
 * Usage:
 * ```typescript
 * // Không cần try-catch!
 * const cart = await CartService.getCart();
 * if (cart) {
 *   setCart(cart);
 * }
 *
 * const added = await CartService.addItem(productId, quantity);
 * if (added) {
 *   showSuccess("Added to cart!");
 * }
 * ```
 */
class CartServiceClass extends BaseApiService<CartItem> {
  protected baseEndpoint = ENDPOINTS.CART.BASE;

  /**
   * Get cart with summary
   * Returns null on error
   */
  async getCart(): Promise<Cart | null> {
    return this.safeCall(async () => {
      const response = await apiClient.get<{data: Cart}>(this.baseEndpoint);
      return response.data;
    }, null);
  }

  /**
   * Add item to cart
   * Returns added item or null on error
   */
  async addItem(productId: number, quantity: number): Promise<CartItem | null> {
    return this.safeCall(async () => {
      const response = await apiClient.post<{data: CartItem}>(ENDPOINTS.CART.ADD, {productId, quantity});
      return response.data;
    }, null);
  }

  /**
   * Sync cart from client
   * Returns synced cart or null on error
   */
  async syncCart(items: Array<{productId: number; quantity: number}>): Promise<Cart | null> {
    return this.safeCall(async () => {
      const response = await apiClient.post<{data: Cart}>(ENDPOINTS.CART.SYNC, {items});
      return response.data;
    }, null);
  }

  /**
   * Update item quantity
   * Returns updated item or null on error
   */
  async updateItem(id: number, quantity: number): Promise<CartItem | null> {
    return this.safeCall(async () => {
      const response = await apiClient.put<{data: CartItem}>(ENDPOINTS.CART.UPDATE(id), {quantity});
      return response.data;
    }, null);
  }

  /**
   * Remove item from cart
   * Returns true on success, false on error
   */
  async removeItem(id: number): Promise<boolean> {
    return this.safeCall(async () => {
      await apiClient.delete(ENDPOINTS.CART.REMOVE(id));
      return true;
    }, false);
  }

  /**
   * Clear entire cart
   * Returns true on success, false on error
   */
  async clearCart(): Promise<boolean> {
    return this.safeCall(async () => {
      await apiClient.delete(ENDPOINTS.CART.CLEAR);
      return true;
    }, false);
  }

  /**
   * Clear cart by restaurant
   * Returns true on success, false on error
   */
  async clearByRestaurant(restaurantId: number): Promise<boolean> {
    return this.safeCall(async () => {
      await apiClient.delete(`${this.baseEndpoint}/restaurant/${restaurantId}`);
      return true;
    }, false);
  }

  /**
   * Batch add items
   * Returns array of added items (empty on complete failure)
   */
  async batchAddItems(items: Array<{productId: number; quantity: number}>): Promise<CartItem[]> {
    return this.safeCall(async () => {
      const results = await Promise.allSettled(items.map((item) => this.addItem(item.productId, item.quantity)));
      return results.filter((r) => r.status === "fulfilled" && r.value).map((r: any) => r.value);
    }, []);
  }

  /**
   * Validate cart items availability
   * Returns array of unavailable product IDs
   */
  async validateCartItems(): Promise<number[]> {
    return this.safeCall(async () => {
      const cart = await this.getCart();
      if (!cart) return [];

      const unavailable: number[] = [];
      for (const item of cart.items) {
        if (item.product && !item.product.available) {
          unavailable.push(item.productId);
        }
      }
      return unavailable;
    }, []);
  }

  /**
   * Get cart item count
   * Returns 0 on error
   */
  async getItemCount(): Promise<number> {
    return this.safeCall(
      async () => {
        const cart = await this.getCart();
        return cart?.summary?.totalItems || 0;
      },
      0,
      {silent: true}
    );
  }

  /**
   * Check if product exists in cart
   * Returns false on error
   */
  async isInCart(productId: number): Promise<boolean> {
    return this.safeCall(
      async () => {
        const cart = await this.getCart();
        return cart?.items.some((item) => item.productId === productId) || false;
      },
      false,
      {silent: true}
    );
  }
}

export const CartService = new CartServiceClass();
