import {createBaseStore} from "@/src/base/BaseStore";
import {ProductService} from "@services/product.service";
import {Product} from "../types";

/**
 * Product Base Store
 *
 * Usage:
 * ```typescript
 * const { items, isLoading, fetchAll } = useProductStore();
 * ```
 */
export const useProductStore = createBaseStore<Product>(ProductService, "products", {
  pageSize: 20,
  initialSort: {field: "price", order: "asc"},
});

/**
 * Custom hook for restaurant menu
 *
 * Usage:
 * ```typescript
 * const { items, isLoading, fetchMenu } = useRestaurantMenu();
 *
 * useEffect(() => {
 *   fetchMenu(restaurantId);
 * }, [restaurantId]);
 * ```
 */
export const useRestaurantMenu = () => {
  const store = useProductStore();

  const fetchMenu = async (restaurantId: number) => {
    try {
      store.setLoading(true);
      const response = await ProductService.getByRestaurant(restaurantId, {
        available: true,
      });
      store.setItems(response.data || []);
      store.setError(null);
    } catch (error) {
      store.setError((error as Error).message);
    } finally {
      store.setLoading(false);
    }
  };

  return {
    ...store,
    fetchMenu,
  };
};

/**
 * Custom hook for discounted products
 *
 * Usage:
 * ```typescript
 * const { items, isLoading, fetchDeals } = useProductDeals();
 *
 * useEffect(() => {
 *   fetchDeals();
 * }, []);
 * ```
 */
export const useProductDeals = () => {
  const store = useProductStore();

  const fetchDeals = async () => {
    try {
      store.setLoading(true);
      const response = await ProductService.getDiscounted({
        page: 1,
        limit: 20,
        sort: "discount",
        order: "desc",
      });
      store.setItems(response.data || []);
      store.setError(null);
    } catch (error) {
      store.setError((error as Error).message);
    } finally {
      store.setLoading(false);
    }
  };

  return {
    ...store,
    fetchDeals,
  };
};

/**
 * Custom hook for product filters
 *
 * Usage:
 * ```typescript
 * const {
 *   items,
 *   filterByPrice,
 *   filterByCategory,
 *   filterAvailable
 * } = useProductFilters();
 * ```
 */
export const useProductFilters = () => {
  const store = useProductStore();

  const filterByPrice = (minPrice: number, maxPrice: number) => {
    store.setFilters({
      price_gte: minPrice,
      price_lte: maxPrice,
    });
    store.applyFilters();
  };

  const filterByCategory = (categoryId: number) => {
    store.setFilters({categoryId});
    store.applyFilters();
  };

  const filterAvailable = (available: boolean) => {
    store.setFilters({available});
    store.applyFilters();
  };

  const filterByDiscount = () => {
    store.setFilters({discount_ne: 0});
    store.applyFilters();
  };

  return {
    ...store,
    filterByPrice,
    filterByCategory,
    filterAvailable,
    filterByDiscount,
  };
};

/**
 * Custom hook for product detail
 *
 * Usage:
 * ```typescript
 * const { product, isLoading, fetchProduct } = useProductDetail();
 *
 * useEffect(() => {
 *   fetchProduct(productId);
 * }, [productId]);
 * ```
 */
export const useProductDetail = () => {
  const store = useProductStore();

  const fetchProduct = async (id: number) => {
    try {
      store.setLoading(true);
      const product = await ProductService.getWithRestaurant(id);
      store.setCurrentItem(product);
      store.setError(null);
    } catch (error) {
      store.setError((error as Error).message);
    } finally {
      store.setLoading(false);
    }
  };

  return {
    product: store.currentItem,
    isLoading: store.isLoading,
    error: store.error,
    fetchProduct,
  };
};
