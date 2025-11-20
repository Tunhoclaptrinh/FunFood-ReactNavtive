export interface Restaurant {
  id: number;
  name: string;
  description: string;
  image: string;
  rating: number;
  totalReviews: number;
  deliveryTime: string;
  deliveryFee: number;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  isOpen: boolean;
  categoryId: number;
  distance?: number;
}

export interface NearbyRestaurantsParams {
  latitude: number;
  longitude: number;
  radius?: number;
}
