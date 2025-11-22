import {createBaseStore} from "@/src/base/BaseStore";
import {RestaurantService} from "@services/restaurant.service";
import {Restaurant} from "../types";

/**
 * Restaurant Store với tất cả base features:
 * - Pagination
 * - Filtering
 * - Sorting
 * - Search
 * - Loading states
 * - Error handling
 *
 * Usage:
 * ```typescript
 * const {
 *   items,
 *   isLoading,
 *   fetchAll,
 *   search,
 *   setFilters,
 *   refresh
 * } = useRestaurantStore();
 *
 * // Fetch all
 * useEffect(() => {
 *   fetchAll();
 * }, []);
 *
 * // Search
 * search("pizza");
 *
 * // Filter
 * setFilters({ categoryId: 1, isOpen: true });
 * applyFilters();
 *
 * // Sort
 * setSorting("rating", "desc");
 * ```
 */
export const useRestaurantStore = createBaseStore<Restaurant>(RestaurantService, "restaurants", {
  pageSize: 10,
  initialSort: {field: "rating", order: "desc"},
});

/**
 * Custom hook for nearby restaurants with GPS
 *
 * Usage:
 * ```typescript
 * const { items, isLoading, fetchNearby } = useNearbyRestaurants();
 *
 * // Fetch nearby
 * useEffect(() => {
 *   if (location) {
 *     fetchNearby(location.latitude, location.longitude, 5);
 *   }
 * }, [location]);
 * ```
 */
export const useNearbyRestaurants = () => {
  const store = useRestaurantStore();

  const fetchNearby = async (latitude: number, longitude: number, radius = 5) => {
    try {
      store.setLoading(true);
      const response = await RestaurantService.getNearby({
        latitude,
        longitude,
        radius,
        isOpen: true,
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
    fetchNearby,
  };
};

/**
 * Custom hook for restaurant filters
 *
 * Usage:
 * ```typescript
 * const {
 *   items,
 *   filterByCategory,
 *   filterByRating,
 *   filterByOpen
 * } = useRestaurantFilters();
 *
 * // Filter by category
 * filterByCategory(1);
 *
 * // Filter by rating
 * filterByRating(4.5);
 *
 * // Filter open only
 * filterByOpen(true);
 * ```
 */
export const useRestaurantFilters = () => {
  const store = useRestaurantStore();

  const filterByCategory = (categoryId: number) => {
    store.setFilters({categoryId});
    store.applyFilters();
  };

  const filterByRating = (minRating: number) => {
    store.setFilters({rating_gte: minRating});
    store.applyFilters();
  };

  const filterByOpen = (isOpen: boolean) => {
    store.setFilters({isOpen});
    store.applyFilters();
  };

  const filterByPriceRange = (min: number, max: number) => {
    store.setFilters({
      price_gte: min,
      price_lte: max,
    });
    store.applyFilters();
  };

  const filterByDistance = (maxDistance: number) => {
    store.setFilters({
      distance_lte: maxDistance,
    });
    store.applyFilters();
  };

  const clearAllFilters = () => {
    store.clearFilters();
  };

  return {
    ...store,
    filterByCategory,
    filterByRating,
    filterByOpen,
    filterByPriceRange,
    filterByDistance,
    clearAllFilters,
  };
};

/**
 * Custom hook for restaurant detail
 *
 * Usage:
 * ```typescript
 * const { restaurant, isLoading, fetchRestaurant } = useRestaurantDetail();
 *
 * useEffect(() => {
 *   fetchRestaurant(restaurantId);
 * }, [restaurantId]);
 * ```
 */
export const useRestaurantDetail = () => {
  const store = useRestaurantStore();

  const fetchRestaurant = async (id: number) => {
    try {
      store.setLoading(true);
      const restaurant = await RestaurantService.getFullDetails(id);
      store.setCurrentItem(restaurant);
      store.setError(null);
    } catch (error) {
      store.setError((error as Error).message);
    } finally {
      store.setLoading(false);
    }
  };

  return {
    restaurant: store.currentItem,
    isLoading: store.isLoading,
    error: store.error,
    fetchRestaurant,
  };
};
