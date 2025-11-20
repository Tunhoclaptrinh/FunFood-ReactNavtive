import {create} from "zustand";
import {CartItem, Product} from "@types/index";

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity: number) => void;
  removeItem: (cartItemId: number) => void;
  updateQuantity: (cartItemId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (product, quantity) => {
    set((state) => {
      const existing = state.items.find((item) => item.productId === product.id);

      if (existing) {
        return {
          items: state.items.map((item) =>
            item.productId === product.id ? {...item, quantity: item.quantity + quantity} : item
          ),
        };
      }

      return {
        items: [
          ...state.items,
          {
            id: Date.now(),
            productId: product.id,
            quantity,
            product,
          },
        ],
      };
    });
  },

  removeItem: (cartItemId) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== cartItemId),
    }));
  },

  updateQuantity: (cartItemId, quantity) => {
    if (quantity === 0) {
      get().removeItem(cartItemId);
      return;
    }

    set((state) => ({
      items: state.items.map((item) => (item.id === cartItemId ? {...item, quantity} : item)),
    }));
  },

  clearCart: () => set({items: []}),

  getTotalPrice: () => {
    return get().items.reduce((total, item) => {
      const price = item.product?.price || 0;
      const discount = item.product?.discount || 0;
      const finalPrice = price * (1 - discount / 100);
      return total + finalPrice * item.quantity;
    }, 0);
  },
}));
