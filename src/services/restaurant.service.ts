import {Restaurant, NearbyRestaurantsParams, PaginatedResponse, ApiResponse} from "../types";
import {apiClient} from "./api.client";
import {ENDPOINTS} from "../config/api.config";

export class RestaurantService {
  static async getNearby(params: NearbyRestaurantsParams & {_page?: number; _limit?: number}) {
    try {
      const response = await apiClient.get<PaginatedResponse<Restaurant>>(ENDPOINTS.RESTAURANTS.NEARBY, params);
      console.log("getNearby response:", response.data);

      // Helper để parse boolean từ bất kỳ type nào
      const toBoolean = (val: any): boolean => {
        if (val === true || val === 1 || val === "1") return true;
        if (val === false || val === 0 || val === "0") return false;
        if (typeof val === "string") return val.toLowerCase() === "true";
        return Boolean(val);
      };

      const toNumber = (val: any): number => {
        const num = typeof val === "string" ? parseFloat(val) : val;
        return isNaN(num) ? 0 : num;
      };

      const restaurants = response.data.data.map((r: any) => ({
        ...r,
        isOpen: toBoolean(r.isOpen),
        rating: toNumber(r.rating),
        deliveryFee: toNumber(r.deliveryFee),
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

      const toBoolean = (val: any): boolean => {
        if (val === true || val === 1 || val === "1") return true;
        if (val === false || val === 0 || val === "0") return false;
        if (typeof val === "string") return val.toLowerCase() === "true";
        return Boolean(val);
      };

      const toNumber = (val: any): number => {
        const num = typeof val === "string" ? parseFloat(val) : val;
        return isNaN(num) ? 0 : num;
      };

      return {
        ...restaurant,
        isOpen: toBoolean(restaurant.isOpen),
        rating: toNumber(restaurant.rating),
        deliveryFee: toNumber(restaurant.deliveryFee),
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
