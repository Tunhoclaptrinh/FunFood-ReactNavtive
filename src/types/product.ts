export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  discount: number;
  image: string;
  restaurantId: number;
  categoryId: number;
  available: boolean;
  rating?: number;
  totalReviews?: number;
}
