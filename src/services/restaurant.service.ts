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

  //Get nearby restaurants with GPS
  async getNearby(params: NearbyParams): Promise<PaginatedResponse<Restaurant>> {
    return this.safeCall(
      async () => {
        const response = await apiClient.get<PaginatedResponse<Restaurant>>(`${this.baseEndpoint}/nearby`, params);
        return response;
      },
      {success: false, count: 0, data: []}
    );
  }

  // Get restaurant menu (products)
  async getMenu(restaurantId: number, page = 1, limit = 20) {
    return this.safeCall(
      async () => {
        const response = await apiClient.get(`${this.baseEndpoint}/${restaurantId}/products`, {
          _page: page,
          _limit: limit,
        });
        return response;
      },
      {success: false, count: 0, data: []}
    );
  }

  // Get restaurant with full details (products + reviews + category)

  async getFullDetails(restaurantId: number): Promise<Restaurant> {
    return this.getWithRelations(restaurantId, {
      embed: ["products", "reviews"],
      expand: ["category"],
    }) as any;
  }

  // Get open restaurants only
  async getOpenRestaurants(params?: any): Promise<PaginatedResponse<Restaurant>> {
    return this.filter({isOpen: true, ...params});
  }

  // Get highly rated restaurants (rating >= 4.5)
  async getHighlyRated(params?: any): Promise<PaginatedResponse<Restaurant>> {
    return this.filter({rating_gte: 4.5, ...params});
  }

  //Get discounted products from restaurant

  async getDiscountedMenu(restaurantId: number): Promise<PaginatedResponse<any>> {
    const response = await apiClient.get<PaginatedResponse<any>>(`${this.baseEndpoint}/${restaurantId}/products`, {
      discount_ne: 0,
      available: true,
    });
    return response.data as any;
  }

  // Search restaurants by name or address
  async searchRestaurants(query: string, params?: any): Promise<PaginatedResponse<Restaurant>> {
    return this.search(query, params);
  }

  // Get restaurants by category
  async getByCategory(categoryId: number, params?: any): Promise<PaginatedResponse<Restaurant>> {
    return this.filter({categoryId, ...params});
  }
}

export const RestaurantService = new RestaurantServiceClass();
