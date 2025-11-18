import {create} from "zustand";
import {CartItem, Product} from "@types/models.types";

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity: number) => void;
  removeItem: (cartItemId: number) => void;
  updateQuantity: (cartItemId: number, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: (product, quantity) =>
    set((state) => {
      const existing = state.items.find((item) => item.productId === product.id);
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.id === existing.id ? {...item, quantity: item.quantity + quantity} : item
          ),
        };
      }
      return {
        items: [
          ...state.items,
          {
            id: Math.random(),
            userId: 0,
            productId: product.id,
            quantity,
            product,
          },
        ],
      };
    }),

  removeItem: (cartItemId) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== cartItemId),
    })),

  updateQuantity: (cartItemId, quantity) =>
    set((state) => ({
      items: state.items.map((item) => (item.id === cartItemId ? {...item, quantity} : item)),
    })),

  clearCart: () => set({items: []}),

  getCartTotal: () => {
    const state = get();
    return state.items.reduce((total, item) => {
      const price = item.product?.price || 0;
      return total + price * item.quantity;
    }, 0);
  },

  getItemCount: () => {
    const state = get();
    return state.items.reduce((count, item) => count + item.quantity, 0);
  },
}));
