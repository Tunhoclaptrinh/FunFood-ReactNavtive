import {useState, useCallback, useRef, useEffect} from "react";

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  isSuccess: boolean;
}

export interface UseApiActions<T> {
  execute: (...args: any[]) => Promise<T>;
  reset: () => void;
  setData: (data: T | null) => void;
}

export interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
  immediate?: boolean; // Auto execute on mount
  immediateArgs?: any[];
}

export type UseApi<T> = UseApiState<T> & UseApiActions<T>;

/**
 * Enhanced API hook với advanced features
 *
 * Features:
 * - Loading, error, success states
 * - Callbacks (onSuccess, onError, onSettled)
 * - Immediate execution on mount
 * - Request cancellation
 * - Memory leak prevention
 *
 * Usage:
 * ```typescript
 * // Basic usage
 * const { data, loading, error, execute } = useApi(
 *   restaurantService.getNearby
 * );
 *
 * // Với callbacks
 * const { data, loading, execute } = useApi(
 *   restaurantService.getNearby,
 *   {
 *     onSuccess: (data) => console.log('Loaded:', data),
 *     onError: (error) => console.error('Error:', error),
 *     onSettled: () => console.log('Done')
 *   }
 * );
 *
 * // Auto execute on mount
 * const { data, loading } = useApi(
 *   restaurantService.getAll,
 *   {
 *     immediate: true,
 *     immediateArgs: [{ page: 1, limit: 10 }]
 *   }
 * );
 *
 * // Manual execute
 * await execute({ latitude: 10.7756, longitude: 106.7019 });
 * ```
 */
export function useApi<T>(apiFunction: (...args: any[]) => Promise<T>, options: UseApiOptions = {}): UseApi<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
    isSuccess: false,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  // Execute API call
  const execute = useCallback(
    async (...args: any[]) => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      setState({data: null, loading: true, error: null, isSuccess: false});

      try {
        const result = await apiFunction(...args);

        if (!isMountedRef.current) return result;

        setState({data: result, loading: false, error: null, isSuccess: true});

        // Call success callback
        if (options.onSuccess) {
          options.onSuccess(result);
        }

        return result;
      } catch (error) {
        if (!isMountedRef.current) return Promise.reject(error);

        const errorObj = error instanceof Error ? error : new Error(String(error));

        setState({data: null, loading: false, error: errorObj, isSuccess: false});

        // Call error callback
        if (options.onError) {
          options.onError(errorObj);
        }

        throw errorObj;
      } finally {
        if (isMountedRef.current && options.onSettled) {
          options.onSettled();
        }
      }
    },
    [apiFunction, options]
  );

  // Reset state
  const reset = useCallback(() => {
    setState({data: null, loading: false, error: null, isSuccess: false});
  }, []);

  // Set data manually
  const setData = useCallback((data: T | null) => {
    setState((prev) => ({...prev, data}));
  }, []);

  // Immediate execution on mount
  useEffect(() => {
    if (options.immediate) {
      execute(...(options.immediateArgs || []));
    }
  }, []); // Only on mount

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {...state, execute, reset, setData};
}

/**
 * Mutation hook for create/update/delete operations
 * Similar to React Query's useMutation
 *
 * Usage:
 * ```typescript
 * const createRestaurant = useMutation(
 *   restaurantService.create,
 *   {
 *     onSuccess: (data) => {
 *       console.log('Created:', data);
 *       // Refresh list
 *       fetchAll();
 *     }
 *   }
 * );
 *
 * await createRestaurant.execute({ name: "New Restaurant", ... });
 * ```
 */
export function useMutation<T, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<T>,
  options: UseApiOptions = {}
) {
  return useApi<T>(mutationFn, options);
}

/**
 * Query hook với simple caching
 * Similar to React Query's useQuery
 *
 * Usage:
 * ```typescript
 * const { data, loading, error } = useQuery(
 *   ['restaurants', restaurantId],
 *   () => restaurantService.getById(restaurantId),
 *   {
 *     staleTime: 5 * 60 * 1000, // 5 minutes
 *     cacheTime: 10 * 60 * 1000, // 10 minutes
 *   }
 * );
 * ```
 */
export function useQuery<T>(
  queryKey: string | string[],
  queryFn: () => Promise<T>,
  options: UseApiOptions & {
    staleTime?: number; // Time before data is considered stale (ms)
    cacheTime?: number; // Time to keep cache alive (ms)
    refetchOnMount?: boolean;
  } = {}
) {
  const cacheKey = Array.isArray(queryKey) ? queryKey.join("-") : queryKey;
  const [cache] = useState<Map<string, {data: T; timestamp: number}>>(new Map());

  const api = useApi<T>(queryFn, {
    ...options,
    immediate: false, // We'll handle this manually
  });

  useEffect(() => {
    const cached = cache.get(cacheKey);
    const now = Date.now();
    const staleTime = options.staleTime || 0;

    // Use cache if not stale
    if (cached && now - cached.timestamp < staleTime) {
      api.setData(cached.data);
      return;
    }

    // Fetch fresh data
    if (options.immediate !== false) {
      api.execute().then((data) => {
        cache.set(cacheKey, {data, timestamp: now});

        // Clear cache after cacheTime
        if (options.cacheTime) {
          setTimeout(() => {
            cache.delete(cacheKey);
          }, options.cacheTime);
        }
      });
    }
  }, [cacheKey]);

  return api;
}
