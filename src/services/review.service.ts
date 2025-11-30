// src/services/review.service.ts
import {BaseApiService, PaginatedResponse} from "@/src/base/BaseApiService";
import {apiClient} from "@config/api.client";
import {ENDPOINTS} from "@config/api.config";
import {Review, CreateReviewRequest} from "@/src/types";

/**
 * Review Validation Result
 */
interface ReviewValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Enhanced Review Service với automatic error handling
 * Unified API for Restaurant & Product reviews
 *
 * Features:
 * - No try-catch needed
 * - Built-in validation
 * - Returns null/false on errors
 * - Automatic error alerts
 *
 * Usage:
 * ```typescript
 * // Validate first
 * const validation = ReviewService.validateReview(reviewData);
 * if (!validation.isValid) {
 *   setErrors(validation.errors);
 *   return;
 * }
 *
 * // Create review - no try-catch!
 * const review = await ReviewService.createReview(reviewData);
 * if (review) {
 *   showSuccess("Review submitted!");
 * }
 * ```
 */
class ReviewServiceClass extends BaseApiService<Review> {
  protected baseEndpoint = ENDPOINTS.REVIEWS.BASE;

  /**
   * Validate review data
   * Returns validation result with specific errors
   */
  validateReview(data: CreateReviewRequest): ReviewValidationResult {
    const errors: Record<string, string> = {};

    // Type validation
    if (!data.type || !["restaurant", "product"].includes(data.type)) {
      errors.type = "Loại đánh giá không hợp lệ";
    }

    // Restaurant validation
    if (!data.restaurantId) {
      errors.restaurantId = "ID nhà hàng không hợp lệ";
    }

    // Product validation (if type is product)
    if (data.type === "product" && !data.productId) {
      errors.productId = "ID sản phẩm không hợp lệ";
    }

    // Rating validation
    if (!data.rating || data.rating < 1 || data.rating > 5) {
      errors.rating = "Đánh giá phải từ 1-5 sao";
    }

    // Comment validation
    if (!data.comment || data.comment.trim().length < 5) {
      errors.comment = "Nhận xét phải có ít nhất 5 ký tự";
    } else if (data.comment.length > 500) {
      errors.comment = "Nhận xét không được vượt quá 500 ký tự";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Create review
   * Returns created review or null on error
   */
  async createReview(data: CreateReviewRequest): Promise<Review | null> {
    return this.safeCall(async () => {
      const response = await apiClient.post<{data: Review}>(ENDPOINTS.REVIEWS.CREATE, data);
      return response.data;
    }, null);
  }

  /**
   * Get restaurant reviews
   * Returns empty response on error
   */
  async getRestaurantReviews(restaurantId: number, page = 1, limit = 10): Promise<PaginatedResponse<Review>> {
    return this.safeCall(
      async () => {
        const response = await apiClient.get<PaginatedResponse<Review>>(
          ENDPOINTS.REVIEWS.GET_RESTAURANT(restaurantId),
          {_page: page, _limit: limit}
        );
        return response;
      },
      {success: false, count: 0, data: []}
    );
  }

  /**
   * Get product reviews
   * Returns empty response on error
   */
  async getProductReviews(productId: number, page = 1, limit = 10): Promise<PaginatedResponse<Review>> {
    return this.safeCall(
      async () => {
        const response = await apiClient.get<PaginatedResponse<Review>>(`${this.baseEndpoint}/product/${productId}`, {
          _page: page,
          _limit: limit,
        });
        return response;
      },
      {success: false, count: 0, data: []}
    );
  }

  /**
   * Get user's reviews
   * Returns empty response on error
   */
  async getMyReviews(): Promise<PaginatedResponse<Review>> {
    return this.safeCall(
      async () => {
        const response = await apiClient.get<PaginatedResponse<Review>>(`${this.baseEndpoint}/user/me`);
        return response;
      },
      {success: false, count: 0, data: []}
    );
  }

  /**
   * Update review
   * Returns updated review or null on error
   */
  async updateReview(id: number, data: {rating: number; comment: string}): Promise<Review | null> {
    return this.update(id, data as any);
  }

  /**
   * Delete review
   * Returns true on success, false on error
   */
  async deleteReview(id: number): Promise<boolean> {
    return this.delete(id);
  }

  /**
   * Check if user reviewed
   * Returns false on error
   */
  async checkReviewed(type: string, targetId: number): Promise<boolean> {
    return this.safeCall(
      async () => {
        const response = await apiClient.get<{data: {hasReviewed: boolean}}>(
          `${this.baseEndpoint}/check/${type}/${targetId}`
        );
        return response.data.hasReviewed;
      },
      false,
      {silent: true}
    );
  }

  /**
   * Get user's review stats
   * Returns null on error
   */
  async getUserStats(): Promise<any> {
    return this.safeCall(
      async () => {
        const response = await apiClient.get<{data: any}>(`${this.baseEndpoint}/user/stats`);
        return response.data;
      },
      null,
      {silent: true}
    );
  }

  /**
   * Get average rating for target
   * Returns 0 on error
   */
  async getAverageRating(type: "restaurant" | "product", targetId: number): Promise<number> {
    return this.safeCall(
      async () => {
        const reviews =
          type === "restaurant"
            ? await this.getRestaurantReviews(targetId, 1, 1)
            : await this.getProductReviews(targetId, 1, 1);

        if (reviews.data.length === 0) return 0;

        const sum = reviews.data.reduce((acc, r) => acc + r.rating, 0);
        return sum / reviews.data.length;
      },
      0,
      {silent: true}
    );
  }

  /**
   * Get review count for target
   * Returns 0 on error
   */
  async getReviewCount(type: "restaurant" | "product", targetId: number): Promise<number> {
    return this.safeCall(
      async () => {
        const reviews =
          type === "restaurant"
            ? await this.getRestaurantReviews(targetId, 1, 1)
            : await this.getProductReviews(targetId, 1, 1);

        return reviews.pagination?.total || 0;
      },
      0,
      {silent: true}
    );
  }

  /**
   * Get reviews by rating
   * Returns empty response on error
   */
  async getReviewsByRating(
    type: "restaurant" | "product",
    targetId: number,
    rating: number,
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<Review>> {
    return this.filter(
      {
        ...(type === "restaurant" ? {restaurantId: targetId} : {productId: targetId}),
        rating,
      },
      {page, limit}
    );
  }

  /**
   * Get recent reviews
   * Returns empty array on error
   */
  async getRecentReviews(limit = 5): Promise<Review[]> {
    return this.safeCall(async () => {
      const response = await this.getAll({
        page: 1,
        limit,
        sort: "createdAt",
        order: "desc",
      });
      return response.data || [];
    }, []);
  }
}

export const ReviewService = new ReviewServiceClass();
