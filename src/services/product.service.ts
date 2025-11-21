import {BaseApiService, PaginatedResponse} from "@/src/base/BaseApiService";
import {apiClient} from "@config/api.client";
import {Product} from "../types";

/**
 * Product Service extending BaseApiService
 *
 * Inherited methods:
 * - getAll(), getById(), create(), update(), delete()
 * - search(), filter(), getWithRelations()
 *
 * Custom methods:
 * - getDiscounted() - Products with discounts
 * - getByRestaurant() - Products from specific restaurant
 * - getByCategory() - Products by category
 * - getAvailable() - Available products only
 */
class ProductServiceClass extends BaseApiService<Product> {
  protected baseEndpoint = "/products";

  /**
   * Get discounted products
   *
   * Example:
   * ```typescript
   * const deals = await productService.getDiscounted({ page: 1, limit: 20 });
   * ```
   */
  async getDiscounted(params?: any): Promise<PaginatedResponse<Product>> {
    return this.filter({discount_ne: 0, available: true, ...params});
  }

  /**
   * Get products by restaurant
   *
   * Example:
   * ```typescript
   * const menu = await productService.getByRestaurant(1, { available: true });
   * ```
   */
  async getByRestaurant(restaurantId: number, params?: any): Promise<PaginatedResponse<Product>> {
    return this.filter({restaurantId, ...params});
  }

  /**
   * Get products by category
   *
   * Example:
   * ```typescript
   * const vietnamese = await productService.getByCategory(1);
   * ```
   */
  async getByCategory(categoryId: number, params?: any): Promise<PaginatedResponse<Product>> {
    return this.filter({categoryId, ...params});
  }

  /**
   * Get available products only
   *
   * Example:
   * ```typescript
   * const available = await productService.getAvailable();
   * ```
   */
  async getAvailable(params?: any): Promise<PaginatedResponse<Product>> {
    return this.filter({available: true, ...params});
  }

  /**
   * Get products by price range
   *
   * Example:
   * ```typescript
   * const affordable = await productService.getByPriceRange(10000, 50000);
   * ```
   */
  async getByPriceRange(minPrice: number, maxPrice: number, params?: any): Promise<PaginatedResponse<Product>> {
    return this.filter({
      price_gte: minPrice,
      price_lte: maxPrice,
      ...params,
    });
  }

  /**
   * Search products
   *
   * Example:
   * ```typescript
   * const results = await productService.searchProducts("pizza");
   * ```
   */
  async searchProducts(query: string, params?: any): Promise<PaginatedResponse<Product>> {
    return this.search(query, params);
  }

  /**
   * Get product with restaurant details
   *
   * Example:
   * ```typescript
   * const product = await productService.getWithRestaurant(1);
   * ```
   */
  async getWithRestaurant(productId: number): Promise<Product> {
    return this.getWithRelations(productId, {
      expand: ["restaurant", "category"],
    });
  }
}

export const ProductService = new ProductServiceClass();
