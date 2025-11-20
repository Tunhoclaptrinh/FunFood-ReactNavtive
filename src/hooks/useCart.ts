import {useCartStore} from "../stores/appStore";

export const useCart = () => {
  const store = useCartStore();

  return {
    items: store.items,
    addItem: store.addItem,
    removeItem: store.removeItem,
    updateQuantity: store.updateQuantity,
    clearCart: store.clearCart,
    totalItems: store.items.length,
    totalPrice: store.getTotalPrice(),
  };
};
