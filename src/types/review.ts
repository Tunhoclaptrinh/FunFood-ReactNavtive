export interface Review {
  id: number;
  userId: number;
  restaurantId: number;
  productId?: number;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewRequest {
  type: "restaurant" | "product";
  restaurantId: number;
  productId?: number;
  rating: number;
  comment: string;
}
