import {create} from "zustand";
import {FavoriteService} from "@services/favorite.service";

interface FavoriteState {
  restaurantIds: number[];
  productIds: number[];
  isLoading: boolean;

  // Actions
  fetchFavorites: () => Promise<void>;
  toggleFavorite: (type: "restaurant" | "product", id: number) => Promise<void>;
  isFavorite: (type: "restaurant" | "product", id: number) => boolean;
}

export const useFavoriteStore = create<FavoriteState>((set, get) => ({
  restaurantIds: [],
  productIds: [],
  isLoading: false,

  // Lấy danh sách ID đã thích từ Server khi mở app
  fetchFavorites: async () => {
    set({isLoading: true});
    try {
      const [restIds, prodIds] = await Promise.all([
        FavoriteService.getFavoriteIds("restaurant"),
        FavoriteService.getFavoriteIds("product"),
      ]);
      set({restaurantIds: restIds, productIds: prodIds});
    } catch (error) {
      console.error("Lỗi tải danh sách yêu thích:", error);
    } finally {
      set({isLoading: false});
    }
  },

  // Xử lý logic like/unlike
  toggleFavorite: async (type, id) => {
    const isRest = type === "restaurant";
    const currentList = isRest ? get().restaurantIds : get().productIds;

    // 1. Optimistic Update: Cập nhật Store ngay lập tức
    const exists = currentList.includes(id);
    const newList = exists ? currentList.filter((itemId) => itemId !== id) : [...currentList, id];

    if (isRest) {
      set({restaurantIds: newList});
    } else {
      set({productIds: newList});
    }

    // 2. Gọi API ngầm bên dưới
    try {
      await FavoriteService.toggleFavorite(type, id);
    } catch (error) {
      // Nếu API lỗi, revert lại state cũ
      console.error("Lỗi toggle favorite:", error);
      if (isRest) {
        set({restaurantIds: currentList});
      } else {
        set({productIds: currentList});
      }
    }
  },

  // Hàm check nhanh để dùng trong UI
  isFavorite: (type, id) => {
    if (type === "restaurant") {
      return get().restaurantIds.includes(id);
    }
    return get().productIds.includes(id);
  },
}));
