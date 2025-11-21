import {ENDPOINTS} from "../config/api.config";
import {apiClient} from "../config/api.client";

export class FavoriteService {
  static async toggleFavorite(type: "restaurant" | "product", id: number) {
    const response = await apiClient.post(ENDPOINTS.FAVORITES.TOGGLE(type, id));
    return response.data;
  }

  static async getFavorites(type: "restaurant" | "product", page = 1, limit = 20) {
    const response = await apiClient.get(ENDPOINTS.FAVORITES.GET_BY_TYPE(type), {
      _page: page,
      _limit: limit,
    });
    return response.data;
  }
}
