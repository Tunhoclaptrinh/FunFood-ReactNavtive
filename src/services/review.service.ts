import {ENDPOINTS} from "../config/api.config";
import {CreateReviewRequest} from "../types";
import {apiClient} from "./api.client";

export class ReviewService {
  static async createReview(data: CreateReviewRequest) {
    return await apiClient.post(ENDPOINTS.REVIEWS.CREATE, data);
  }

  static async getRestaurantReviews(restaurantId: number, page = 1, limit = 10) {
    const response = await apiClient.get(ENDPOINTS.REVIEWS.GET_RESTAURANT(restaurantId), {_page: page, _limit: limit});
    return response.data;
  }
}
