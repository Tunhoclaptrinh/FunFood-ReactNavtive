// User
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: "customer" | "admin" | "manager" | "shipper";
  isActive: boolean;
  createdAt: string;
}

// Restaurant
export interface Restaurant {
  id: number;
  name: string;
  description: string;
  image: string;
  rating: number;
  totalReviews: number;
  categoryId: number;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  deliveryFee: number;
  deliveryTime: string;
  isOpen: boolean;
}

// Product
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  restaurantId: number;
  categoryId?: number;
  available: boolean;
  discount: number;
}

// Cart
export interface CartItem {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  product?: Product;
}

// Order
export interface Order {
  id: number;
  userId: number;
  restaurantId: number;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  status: "pending" | "confirmed" | "preparing" | "delivering" | "delivered" | "cancelled";
  deliveryAddress: string;
  paymentMethod: "cash" | "card" | "momo" | "zalopay";
  createdAt: string;
}

export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  discount: number;
}

// Review
export interface Review {
  id: number;
  userId: number;
  restaurantId?: number;
  productId?: number;
  rating: number;
  comment: string;
  createdAt: string;
}

// Favorite
export interface Favorite {
  id: number;
  userId: number;
  type: "restaurant" | "product";
  referenceId: number;
}

// Promotion
export interface Promotion {
  id: number;
  code: string;
  description: string;
  discountType: "percentage" | "fixed" | "delivery";
  discountValue: number;
  minOrderValue: number;
  maxDiscount: number;
  isActive: boolean;
}
