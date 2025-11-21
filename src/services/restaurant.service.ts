import {Restaurant, NearbyRestaurantsParams, PaginatedResponse, ApiResponse} from "../types";
import {apiClient} from "./api.client";
import {ENDPOINTS} from "../config/api.config";

export class RestaurantService {
  static async getNearby(params: NearbyRestaurantsParams & {_page?: number; _limit?: number}) {
    try {
      const response = await apiClient.get<PaginatedResponse<Restaurant>>(ENDPOINTS.RESTAURANTS.NEARBY, params);
      console.log("getNearby response:", response.data);

      // Xử lý dữ liệu để đảm bảo kiểu đúng
      const restaurants = response.data.data.map((r: any) => ({
        ...r,
        isOpen: r.isOpen === true || r.isOpen === "true",
        rating: parseFloat(r.rating) || 0,
        deliveryFee: parseFloat(r.deliveryFee) || 0,
      }));

      return {
        ...response.data,
        data: restaurants,
      };
    } catch (error) {
      console.error("getNearby error:", error);
      throw error;
    }
  }

  static async search(query: string, page = 1, limit = 10) {
    try {
      const response = await apiClient.get<PaginatedResponse<Restaurant>>(ENDPOINTS.RESTAURANTS.SEARCH, {
        q: query,
        _page: page,
        _limit: limit,
      });
      return response.data;
    } catch (error) {
      console.error("search error:", error);
      throw error;
    }
  }

  static async getById(id: number) {
    try {
      const response = await apiClient.get<ApiResponse<Restaurant>>(ENDPOINTS.RESTAURANTS.GET_ONE(id));
      const restaurant = response.data.data;

      // Xử lý dữ liệu
      return {
        ...restaurant,
        isOpen: restaurant.isOpen === true || restaurant.isOpen === "true",
        rating: parseFloat(restaurant.rating as any) || 0,
        deliveryFee: parseFloat(restaurant.deliveryFee as any) || 0,
      };
    } catch (error) {
      console.error("getById error:", error);
      throw error;
    }
  }

  static async getMenu(restaurantId: number, page = 1, limit = 20) {
    try {
      const response = await apiClient.get(ENDPOINTS.RESTAURANTS.MENU(restaurantId), {
        _page: page,
        _limit: limit,
      });
      return response.data;
    } catch (error) {
      console.error("getMenu error:", error);
      throw error;
    }
  }
}
