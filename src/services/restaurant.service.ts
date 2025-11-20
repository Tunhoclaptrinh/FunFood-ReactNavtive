import {Restaurant, NearbyRestaurantsParams, PaginatedResponse} from "@types/index";
import {apiClient} from "./api.client";
import {ENDPOINTS} from "../config/api.config";

export class RestaurantService {
  static async getNearby(params: NearbyRestaurantsParams & {_page?: number; _limit?: number}) {
    const response = await apiClient.get<PaginatedResponse<Restaurant>>(ENDPOINTS.RESTAURANTS.NEARBY, params);
    return response.data;
  }

  static async search(query: string, page = 1, limit = 10) {
    const response = await apiClient.get<PaginatedResponse<Restaurant>>(ENDPOINTS.RESTAURANTS.SEARCH, {
      q: query,
      _page: page,
      _limit: limit,
    });
    return response.data;
  }

  static async getById(id: number) {
    const response = await apiClient.get<ApiResponse<Restaurant>>(ENDPOINTS.RESTAURANTS.GET_ONE(id));
    return response.data.data;
  }

  static async getMenu(restaurantId: number, page = 1, limit = 20) {
    const response = await apiClient.get(ENDPOINTS.RESTAURANTS.MENU(restaurantId), {
      _page: page,
      _limit: limit,
    });
    return response.data;
  }
}
