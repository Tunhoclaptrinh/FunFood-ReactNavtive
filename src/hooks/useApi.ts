import {useState, useCallback} from "react";
import {AxiosError} from "axios";
import {ApiResponse} from "@types/api.types";

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>(apiFunc: () => Promise<{data: ApiResponse<T>}>) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async () => {
    setState({data: null, loading: true, error: null});
    try {
      const response = await apiFunc();
      setState({data: response.data.data, loading: false, error: null});
      return response.data.data;
    } catch (err) {
      const errorMessage =
        err instanceof AxiosError ? err.response?.data?.message || "Error occurred" : "Unknown error";
      setState({data: null, loading: false, error: errorMessage});
      throw err;
    }
  }, [apiFunc]);

  return {...state, execute};
}
