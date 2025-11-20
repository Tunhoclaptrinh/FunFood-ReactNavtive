export type OrderStatus = "pending" | "confirmed" | "preparing" | "delivering" | "delivered" | "cancelled";
export type PaymentMethod = "cash" | "card" | "momo" | "zalopay";

export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  discount: number;
}

export interface Order {
  id: number;
  userId: number;
  restaurantId: number;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  deliveryAddress: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  paymentMethod: PaymentMethod;
  note: string;
  promotionCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  restaurantId: number;
  items: {productId: number; quantity: number}[];
  deliveryAddress: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  paymentMethod: PaymentMethod;
  note?: string;
  promotionCode?: string;
}
