import {useState, useCallback} from "react";
import {useCartStore} from "../stores/appStore";
import {CartService} from "../services/cart.service";
import {Alert} from "react-native";
import {Product} from "../types";

export const useCart = () => {
  const store = useCartStore();
  const [loading, setLoading] = useState(false);

  // Đồng bộ giỏ hàng từ Server về Store
  const refreshCart = useCallback(async () => {
    try {
      setLoading(true);
      const cartData = await CartService.getCart();
      store.setItems(cartData.items);
    } catch (error) {
      console.error("Failed to refresh cart", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Hàm thêm vào giỏ hàng (Gọi API)
  const addToCart = async (product: Product, quantity: number) => {
    try {
      setLoading(true);
      // Gọi API thêm sản phẩm
      await CartService.addItem(product.id, quantity);

      // Sau khi thêm thành công, gọi refresh để update lại toàn bộ state từ server
      await refreshCart();
      return true;
    } catch (error: any) {
      console.error("Add to cart error:", error);
      Alert.alert("Lỗi", error.message || "Không thể thêm vào giỏ hàng");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Hàm xóa item (Gọi API)
  const removeItem = async (itemId: number) => {
    try {
      setLoading(true);
      await CartService.removeItem(itemId);
      await refreshCart();
    } catch (error: any) {
      Alert.alert("Lỗi", "Không thể xóa sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  // Hàm update số lượng (Gọi API)
  const updateQuantity = async (itemId: number, quantity: number) => {
    try {
      setLoading(true);
      await CartService.updateItem(itemId, quantity);
      await refreshCart();
    } catch (error: any) {
      Alert.alert("Lỗi", "Không thể cập nhật số lượng");
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      await CartService.clearCart();
      store.setItems([]);
    } catch (e) {
      console.error(e);
    }
  };

  return {
    items: store.items,
    totalItems: store.items.length,
    totalPrice: store.getTotalPrice(),
    isLoading: loading,
    refreshCart,
    addToCart, // Dùng tên này thay vì addItem
    removeItem,
    updateQuantity,
    clearCart,
  };
};
