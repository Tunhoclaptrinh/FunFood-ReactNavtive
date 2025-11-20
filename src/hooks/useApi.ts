import {useState, useCallback} from "react";
import {AxiosError} from "axios";

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: AxiosError | null;
}

export const useApi = <T>(apiFunction: (...args: any[]) => Promise<T>) => {
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
        setState({data: null, loading: false, error: error as AxiosError});
        throw error;
      }
    },
    [apiFunction]
  );

  return {...state, execute};
};
