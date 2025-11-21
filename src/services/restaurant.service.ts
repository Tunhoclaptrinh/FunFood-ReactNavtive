import {BaseApiService, PaginatedResponse} from "@/src/base/BaseApiService";
import {apiClient} from "@config/api.client";
import {Restaurant} from "../types";

interface NearbyParams {
  latitude: number;
  longitude: number;
  radius?: number;
  isOpen?: boolean;
  categoryId?: number;
  rating_gte?: number;
  _page?: number;
  _limit?: number;
}

/**
 * Restaurant Service extending BaseApiService
 *
 * Inherited methods from BaseApiService:
 * - getAll(params)
 * - getById(id, params)
 * - create(data)
 * - update(id, data)
 * - patch(id, data)
 * - delete(id)
 * - search(query, params)
 * - filter(filters, params)
 * - getWithRelations(id, options)
 * - batchDelete(ids)
 * - batchCreate(items)
 * - exists(id)
 * - count(params)
 *
 * Custom methods specific to Restaurant:
 * - getNearby() - GPS-based nearby search
 * - getMenu() - Get restaurant products
 * - getFullDetails() - Get with products + reviews
 * - getOpenRestaurants() - Filter open only
 * - getHighlyRated() - Filter rating >= 4.5
 * - getDiscountedMenu() - Products with discounts
 */
class RestaurantServiceClass extends BaseApiService<Restaurant> {
  protected baseEndpoint = "/restaurants";

  /**
   * Get nearby restaurants with GPS
   *
   * Example:
   * ```typescript
   * const nearby = await restaurantService.getNearby({
   *   latitude: 10.7756,
   *   longitude: 106.7019,
   *   radius: 5,
   *   isOpen: true,
   *   rating_gte: 4.5
   * });
   * ```
   */
  async getNearby(params: NearbyParams): Promise<PaginatedResponse<Restaurant>> {
    const response = await apiClient.get(`${this.baseEndpoint}/nearby`, params);
    return response.data;
  }

  /**
   * Get restaurant menu (products)
   *
   * Example:
   * ```typescript
   * const menu = await restaurantService.getMenu(1, 1, 20);
   * ```
   */
  async getMenu(restaurantId: number, page = 1, limit = 20): Promise<PaginatedResponse<any>> {
    const response = await apiClient.get(`${this.baseEndpoint}/${restaurantId}/products`, {
      _page: page,
      _limit: limit,
    });
    return response.data;
  }

  /**
   * Get restaurant with full details (products + reviews + category)
   *
   * Example:
   * ```typescript
   * const details = await restaurantService.getFullDetails(1);
   * ```
   */
  async getFullDetails(restaurantId: number): Promise<Restaurant> {
    return this.getWithRelations(restaurantId, {
      embed: ["products", "reviews"],
      expand: ["category"],
    });
  }

  /**
   * Get open restaurants only
   *
   * Example:
   * ```typescript
   * const openRestaurants = await restaurantService.getOpenRestaurants({ page: 1, limit: 10 });
   * ```
   */
  async getOpenRestaurants(params?: any): Promise<PaginatedResponse<Restaurant>> {
    return this.filter({isOpen: true, ...params});
  }

  /**
   * Get highly rated restaurants (rating >= 4.5)
   *
   * Example:
   * ```typescript
   * const topRated = await restaurantService.getHighlyRated();
   * ```
   */
  async getHighlyRated(params?: any): Promise<PaginatedResponse<Restaurant>> {
    return this.filter({rating_gte: 4.5, ...params});
  }

  /**
   * Get discounted products from restaurant
   *
   * Example:
   * ```typescript
   * const deals = await restaurantService.getDiscountedMenu(1);
   * ```
   */
  async getDiscountedMenu(restaurantId: number): Promise<PaginatedResponse<any>> {
    const response = await apiClient.get(`${this.baseEndpoint}/${restaurantId}/products`, {
      discount_ne: 0,
      available: true,
    });
    return response.data;
  }

  /**
   * Search restaurants by name or address
   *
   * Example:
   * ```typescript
   * const results = await restaurantService.search("pizza", { page: 1, limit: 10 });
   * ```
   */
  async searchRestaurants(query: string, params?: any): Promise<PaginatedResponse<Restaurant>> {
    return this.search(query, params);
  }

  /**
   * Get restaurants by category
   *
   * Example:
   * ```typescript
   * const vietnamese = await restaurantService.getByCategory(1);
   * ```
   */
  async getByCategory(categoryId: number, params?: any): Promise<PaginatedResponse<Restaurant>> {
    return this.filter({categoryId, ...params});
  }
}

export const RestaurantService = new RestaurantServiceClass();
