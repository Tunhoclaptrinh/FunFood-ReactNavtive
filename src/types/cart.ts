import {Product} from "./product";

export interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product?: Product;
}

export interface Cart {
  items: CartItem[];
  summary: {
    totalItems: number;
    subtotal: number;
    deliveryFee: number;
    total: number;
  };
}
