// Interface cập nhật khớp với Backend trả về
export interface OrderStats {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  shippingOrders: number;
  cancelledOrders: number;
  totalSpent: number;
  avgOrderValue: number;
  totalReviews: number;
  avgRating: number;
  totalFavorites: number;
}

export interface RecentOrder {
  id: number;
  restaurantName: string; // Backend trả về restaurantName hoặc cần map từ restaurantId
  total: number;
  status: string;
  createdAt: string;
}
