import {BaseApiService, PaginatedResponse} from "@/src/base/BaseApiService";
import {apiClient} from "@config/api.client";
import {ENDPOINTS} from "@config/api.config";
import {Favorite, FavoriteType} from "@/src/types";

/**
 * Favorite Service - Extends BaseApiService
 * Unified API for Restaurant & Product favorites
 */
class FavoriteServiceClass extends BaseApiService<Favorite> {
  protected baseEndpoint = ENDPOINTS.FAVORITES.BASE;

  /**
   * Toggle favorite (add/remove)
   */
  async toggleFavorite(type: FavoriteType, id: number): Promise<{isFavorite: boolean}> {
    const response = await apiClient.post<{data: {isFavorite: boolean}}>(ENDPOINTS.FAVORITES.TOGGLE(type, id));
    return response.data.data;
  }

  /**
   * Get favorites by type
   */
  async getFavorites(type: FavoriteType, page = 1, limit = 20): Promise<PaginatedResponse<Favorite>> {
    const response = await apiClient.get<PaginatedResponse<Favorite>>(ENDPOINTS.FAVORITES.GET_BY_TYPE(type), {
      _page: page,
      _limit: limit,
    });
    return response.data;
  }

  /**
   * Check if item is favorite
   */
  async checkFavorite(type: FavoriteType, id: number): Promise<boolean> {
    try {
      const response = await apiClient.get<{data: {isFavorite: boolean}}>(`${this.baseEndpoint}/${type}/${id}/check`);
      return response.data.data.isFavorite;
    } catch {
      return false;
    }
  }

  /**
   * Get all favorites
   */
  async getAllFavorites(): Promise<PaginatedResponse<Favorite>> {
    return this.getAll({limit: 100});
  }

  /**
   * Get favorite IDs only (lightweight)
   */
  async getFavoriteIds(type: FavoriteType): Promise<number[]> {
    const response = await apiClient.get<{data: number[]}>(`${this.baseEndpoint}/${type}/ids`);
    return response.data.data;
  }

  /**
   * Remove favorite
   */
  async removeFavorite(type: FavoriteType, id: number): Promise<void> {
    await apiClient.delete(`${this.baseEndpoint}/${type}/${id}`);
  }
}

export const FavoriteService = new FavoriteServiceClass();
