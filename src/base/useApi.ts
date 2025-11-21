import {useState, useCallback} from "react";

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export interface UseApiActions<T> {
  execute: (...args: any[]) => Promise<T>;
  reset: () => void;
}

export type UseApi<T> = UseApiState<T> & UseApiActions<T>;

/**
 * Hook for managing API call state
 * Usage: const { data, loading, error, execute } = useApi(service.getById)
 */
export function useApi<T>(apiFunction: (...args: any[]) => Promise<T>): UseApi<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: any[]) => {
      setState({data: null, loading: true, error: null});
      try {
        const result = await apiFunction(...args);
        setState({data: result, loading: false, error: null});
        return result;
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        setState({data: null, loading: false, error: errorObj});
        throw errorObj;
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setState({data: null, loading: false, error: null});
  }, []);

  return {...state, execute, reset};
}
