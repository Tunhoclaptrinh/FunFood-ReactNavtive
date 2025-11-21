import {Restaurant, NearbyRestaurantsParams, PaginatedResponse, ApiResponse} from "../types";
import {apiClient} from "./api.client";
import {ENDPOINTS} from "../config/api.config";

export class RestaurantService {
  static async getNearby(params: NearbyRestaurantsParams & {_page?: number; _limit?: number}) {
    try {
      const response = await apiClient.get<PaginatedResponse<Restaurant>>(ENDPOINTS.RESTAURANTS.NEARBY, params);
      console.log("=== FULL API RESPONSE ===");
      console.log(JSON.stringify(response.data, null, 2));

      if (response.data.data && response.data.data.length > 0) {
        console.log("=== FIRST ITEM ===");
        console.log(JSON.stringify(response.data.data[0], null, 2));
      }

      // Trả về raw data mà không transform
      return response.data;
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
      return response.data.data;
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
