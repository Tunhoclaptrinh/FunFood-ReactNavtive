import {create} from "zustand";
import {BaseApiService, PaginationParams} from "./BaseApiService";

export interface BaseStoreState<T> {
  // Data
  items: T[];
  currentItem: T | null;

  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;

  // Error handling
  error: string | null;

  // Pagination
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasMore: boolean;

  // Filters & Search
  filters: Record<string, any>;
  searchQuery: string;
  sortField: string;
  sortOrder: "asc" | "desc";
}

export interface BaseStoreActions<T> {
  // Fetch operations
  fetchAll(params?: PaginationParams): Promise<void>;
  fetchById(id: string | number): Promise<T | null>;
  fetchMore(): Promise<void>;
  refresh(): Promise<void>;
  search(query: string): Promise<void>;

  // Filter & Sort
  setFilters(filters: Record<string, any>): void;
  clearFilters(): void;
  setSorting(field: string, order: "asc" | "desc"): void;
  applyFilters(): Promise<void>;

  // Mutations
  addItem(item: T): void;
  removeItem(id: string | number, idField?: string): void;
  updateItem(id: string | number, updates: Partial<T>): void;
  setItems(items: T[]): void;
  setCurrentItem(item: T | null): void;

  // Pagination
  setPage(page: number): void;
  nextPage(): void;
  prevPage(): void;
  setPageSize(size: number): void;

  // State management
  setLoading(loading: boolean): void;
  setError(error: string | null): void;
  reset(): void;
}

export type BaseStore<T> = BaseStoreState<T> & BaseStoreActions<T>;

/**
 * Enhanced Base Store Factory với full feature support
 *
 * Features:
 * - Pagination (với hasMore, loadMore)
 * - Filtering (setFilters, applyFilters)
 * - Sorting (setSorting)
 * - Search (search query)
 * - Loading states (isLoading, isRefreshing, isLoadingMore)
 * - Error handling
 * - Data mutations (add, update, remove)
 *
 * Usage:
 * ```typescript
 * // 1. Tạo service
 * const restaurantService = new RestaurantService();
 *
 * // 2. Tạo store
 * export const useRestaurantStore = createBaseStore<Restaurant>(
 *   restaurantService,
 *   'restaurants',
 *   {
 *     pageSize: 20,
 *     initialSort: { field: 'rating', order: 'desc' }
 *   }
 * );
 *
 * // 3. Sử dụng trong component
 * const { items, isLoading, fetchAll, search, setFilters } = useRestaurantStore();
 *
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
 * setSorting("price", "asc");
 * ```
 */
export function createBaseStore<T>(
  service: BaseApiService<T>,
  storeName: string,
  config?: {
    pageSize?: number;
    initialSort?: {field: string; order: "asc" | "desc"};
  }
) {
  const defaultPageSize = config?.pageSize || 10;
  const initialSort = config?.initialSort || {field: "id", order: "asc" as const};

  return create<BaseStore<T>>((set, get) => ({
    // Initial State
    items: [],
    currentItem: null,
    isLoading: false,
    isRefreshing: false,
    isLoadingMore: false,
    error: null,
    currentPage: 1,
    pageSize: defaultPageSize,
    totalItems: 0,
    totalPages: 0,
    hasMore: false,
    filters: {},
    searchQuery: "",
    sortField: initialSort.field,
    sortOrder: initialSort.order,

    // Fetch all với current state
    fetchAll: async (params?: PaginationParams) => {
      try {
        set({isLoading: true, error: null});

        const {currentPage, pageSize, sortField, sortOrder, filters, searchQuery} = get();

        const queryParams: PaginationParams = {
          page: currentPage,
          limit: pageSize,
          sort: sortField,
          order: sortOrder,
          ...filters,
          ...(searchQuery && {q: searchQuery}),
          ...params,
        };

        const response = await service.getAll(queryParams);

        set({
          items: response.data,
          totalItems: response.pagination?.total || 0,
          totalPages: response.pagination?.totalPages || 0,
          hasMore: response.pagination?.hasNext || false,
          isLoading: false,
        });
      } catch (error) {
        set({
          error: (error as Error).message,
          isLoading: false,
        });
      }
    },

    // Fetch single item
    fetchById: async (id: string | number) => {
      try {
        set({isLoading: true, error: null});
        const item = await service.getById(id);
        set({currentItem: item, isLoading: false});
        return item;
      } catch (error) {
        set({
          error: (error as Error).message,
          isLoading: false,
        });
        return null;
      }
    },

    // Load more (infinite scroll)
    fetchMore: async () => {
      const {hasMore, isLoadingMore, currentPage} = get();
      if (!hasMore || isLoadingMore) return;

      try {
        set({isLoadingMore: true, error: null});

        const nextPage = currentPage + 1;
        const {pageSize, sortField, sortOrder, filters, searchQuery} = get();

        const response = await service.getAll({
          page: nextPage,
          limit: pageSize,
          sort: sortField,
          order: sortOrder,
          ...filters,
          ...(searchQuery && {q: searchQuery}),
        });

        set((state) => ({
          items: [...state.items, ...response.data],
          currentPage: nextPage,
          hasMore: response.pagination?.hasNext || false,
          isLoadingMore: false,
        }));
      } catch (error) {
        set({
          error: (error as Error).message,
          isLoadingMore: false,
        });
      }
    },

    // Refresh (pull to refresh)
    refresh: async () => {
      try {
        set({isRefreshing: true, error: null, currentPage: 1});
        await get().fetchAll();
        set({isRefreshing: false});
      } catch (error) {
        set({
          error: (error as Error).message,
          isRefreshing: false,
        });
      }
    },

    // Search
    search: async (query: string) => {
      try {
        set({isLoading: true, error: null, searchQuery: query, currentPage: 1});

        const {pageSize, sortField, sortOrder, filters} = get();

        const response = await service.search(query, {
          page: 1,
          limit: pageSize,
          sort: sortField,
          order: sortOrder,
          ...filters,
        });

        set({
          items: response.data,
          totalItems: response.pagination?.total || 0,
          totalPages: response.pagination?.totalPages || 0,
          hasMore: response.pagination?.hasNext || false,
          isLoading: false,
        });
      } catch (error) {
        set({
          error: (error as Error).message,
          isLoading: false,
        });
      }
    },

    // Set filters (không fetch ngay)
    setFilters: (filters: Record<string, any>) => {
      set({filters, currentPage: 1});
    },

    // Clear filters
    clearFilters: () => {
      set({filters: {}, searchQuery: "", currentPage: 1});
      get().fetchAll();
    },

    // Set sorting
    setSorting: (field: string, order: "asc" | "desc") => {
      set({sortField: field, sortOrder: order, currentPage: 1});
      get().fetchAll();
    },

    // Apply current filters
    applyFilters: async () => {
      set({currentPage: 1});
      await get().fetchAll();
    },

    // Mutations
    addItem: (item: T) => {
      set((state) => ({
        items: [item, ...state.items],
        totalItems: state.totalItems + 1,
      }));
    },

    removeItem: (id: string | number, idField: string = "id") => {
      set((state) => ({
        items: state.items.filter((item) => (item as any)[idField] !== id),
        totalItems: Math.max(0, state.totalItems - 1),
      }));
    },

    updateItem: (id: string | number, updates: Partial<T>) => {
      set((state) => ({
        items: state.items.map((item) => ((item as any).id === id ? {...item, ...updates} : item)),
      }));
    },

    setItems: (items: T[]) => {
      set({items, totalItems: items.length});
    },

    setCurrentItem: (item: T | null) => {
      set({currentItem: item});
    },

    // Pagination controls
    setPage: (page: number) => {
      set({currentPage: page});
      get().fetchAll();
    },

    nextPage: () => {
      const {currentPage, hasMore} = get();
      if (hasMore) {
        get().setPage(currentPage + 1);
      }
    },

    prevPage: () => {
      const {currentPage} = get();
      if (currentPage > 1) {
        get().setPage(currentPage - 1);
      }
    },

    setPageSize: (size: number) => {
      set({pageSize: size, currentPage: 1});
      get().fetchAll();
    },

    // State management
    setLoading: (loading: boolean) => {
      set({isLoading: loading});
    },

    setError: (error: string | null) => {
      set({error});
    },

    reset: () => {
      set({
        items: [],
        currentItem: null,
        isLoading: false,
        isRefreshing: false,
        isLoadingMore: false,
        error: null,
        currentPage: 1,
        pageSize: defaultPageSize,
        totalItems: 0,
        totalPages: 0,
        hasMore: false,
        filters: {},
        searchQuery: "",
        sortField: initialSort.field,
        sortOrder: initialSort.order,
      });
    },
  }));
}
