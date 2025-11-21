import {create} from "zustand";
import {BaseApiService, PaginationParams} from "./BaseApiService";

export interface BaseStoreState<T> {
  items: T[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  pageSize: number;
  totalItems: number;
}

export interface BaseStoreActions<T> {
  // Fetch
  fetchAll(params?: PaginationParams): Promise<void>;
  fetchById(id: string | number): Promise<T | null>;
  search(query: string): Promise<void>;

  // Mutations
  addItem(item: T): void;
  removeItem(id: string | number, idField?: string): void;
  updateItem(id: string | number, updates: Partial<T>): void;
  setItems(items: T[]): void;

  // Pagination
  setPage(page: number): void;
  setPageSize(size: number): void;

  // State management
  setLoading(loading: boolean): void;
  setError(error: string | null): void;
  reset(): void;
}

export type BaseStore<T> = BaseStoreState<T> & BaseStoreActions<T>;

/**
 * Create base Zustand store with CRUD + Pagination
 * Usage: const useUserStore = createBaseStore<User>(userService, 'users')
 */
export function createBaseStore<T>(service: BaseApiService<T>, storeName: string) {
  return create<BaseStore<T>>((set, get) => ({
    // State
    items: [],
    isLoading: false,
    error: null,
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,

    // Fetch actions
    fetchAll: async (params?: PaginationParams) => {
      try {
        set({isLoading: true, error: null});
        const response = await service.getAll({
          page: get().currentPage,
          limit: get().pageSize,
          ...params,
        });

        set({
          items: response.data,
          totalItems: response.pagination?.total || 0,
          isLoading: false,
        });
      } catch (error) {
        set({
          error: (error as Error).message,
          isLoading: false,
        });
      }
    },

    fetchById: async (id: string | number) => {
      try {
        set({isLoading: true, error: null});
        const item = await service.getById(id);
        set({isLoading: false});
        return item;
      } catch (error) {
        set({
          error: (error as Error).message,
          isLoading: false,
        });
        return null;
      }
    },

    search: async (query: string) => {
      try {
        set({isLoading: true, error: null});
        const response = await service.search(query, {
          page: 1,
          limit: get().pageSize,
        });

        set({
          items: response.data,
          currentPage: 1,
          totalItems: response.pagination?.total || 0,
          isLoading: false,
        });
      } catch (error) {
        set({
          error: (error as Error).message,
          isLoading: false,
        });
      }
    },

    // Mutations
    addItem: (item: T) => {
      set({items: [...get().items, item]});
    },

    removeItem: (id: string | number, idField: string = "id") => {
      set({
        items: get().items.filter((item) => (item as any)[idField] !== id),
      });
    },

    updateItem: (id: string | number, updates: Partial<T>) => {
      set({
        items: get().items.map((item) => ((item as any).id === id ? {...item, ...updates} : item)),
      });
    },

    setItems: (items: T[]) => {
      set({items});
    },

    // Pagination
    setPage: (page: number) => {
      set({currentPage: page});
      get().fetchAll();
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
        isLoading: false,
        error: null,
        currentPage: 1,
        pageSize: 10,
        totalItems: 0,
      });
    },
  }));
}
