import {BaseApiService, PaginatedResponse} from "@/src/base/BaseApiService";
import {apiClient} from "@config/api.client";
import {ENDPOINTS} from "@config/api.config";
import {Review, CreateReviewRequest} from "@/src/types";

/**
 * Review Service - Extends BaseApiService
 * Unified API for Restaurant & Product reviews
 */
class ReviewServiceClass extends BaseApiService<Review> {
  protected baseEndpoint = ENDPOINTS.REVIEWS.BASE;

  /**
   * Create review
   */
  async createReview(data: CreateReviewRequest): Promise<Review> {
    const response = await apiClient.post<{data: Review}>(ENDPOINTS.REVIEWS.CREATE, data);
    return response.data.data;
  }

  /**
   * Get restaurant reviews
   */
  async getRestaurantReviews(restaurantId: number, page = 1, limit = 10): Promise<PaginatedResponse<Review>> {
    const response = await apiClient.get<PaginatedResponse<Review>>(ENDPOINTS.REVIEWS.GET_RESTAURANT(restaurantId), {
      _page: page,
      _limit: limit,
    });
    return response.data;
  }

  /**
   * Get product reviews
   */
  async getProductReviews(productId: number, page = 1, limit = 10): Promise<PaginatedResponse<Review>> {
    const response = await apiClient.get<PaginatedResponse<Review>>(`${this.baseEndpoint}/product/${productId}`, {
      _page: page,
      _limit: limit,
    });
    return response.data;
  }

  /**
   * Get user's reviews
   */
  async getMyReviews(): Promise<PaginatedResponse<Review>> {
    const response = await apiClient.get<PaginatedResponse<Review>>(`${this.baseEndpoint}/user/me`);
    return response.data;
  }

  /**
   * Update review
   */
  async updateReview(id: number, data: {rating: number; comment: string}): Promise<Review> {
    return this.update(id, data as any);
  }

  /**
   * Delete review
   */
  async deleteReview(id: number): Promise<void> {
    await this.delete(id);
  }

  /**
   * Check if user reviewed
   */
  async checkReviewed(type: string, targetId: number): Promise<boolean> {
    try {
      const response = await apiClient.get<{data: {hasReviewed: boolean}}>(
        `${this.baseEndpoint}/check/${type}/${targetId}`
      );
      return response.data.data.hasReviewed;
    } catch {
      return false;
    }
  }
}

export const ReviewService = new ReviewServiceClass();
