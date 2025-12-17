import {Product} from "./product";
import {Restaurant} from "./restaurant";

export interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product?: Product;
  restaurant?: Restaurant;
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
