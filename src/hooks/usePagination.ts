import {useState, useCallback} from "react";

export interface UsePaginationState {
  page: number;
  limit: number;
  total: number;
}

export function usePagination(initialLimit = 10) {
  const [state, setState] = useState<UsePaginationState>({
    page: 1,
    limit: initialLimit,
    total: 0,
  });

  const goToPage = useCallback((page: number) => {
    setState((prev) => ({...prev, page}));
  }, []);

  const nextPage = useCallback(() => {
    setState((prev) => ({
      ...prev,
      page: Math.min(prev.page + 1, Math.ceil(prev.total / prev.limit)),
    }));
  }, []);

  const prevPage = useCallback(() => {
    setState((prev) => ({...prev, page: Math.max(prev.page - 1, 1)}));
  }, []);

  const setTotal = useCallback((total: number) => {
    setState((prev) => ({...prev, total}));
  }, []);

  const reset = useCallback(() => {
    setState({page: 1, limit: initialLimit, total: 0});
  }, [initialLimit]);

  return {
    page: state.page,
    limit: state.limit,
    total: state.total,
    totalPages: Math.ceil(state.total / state.limit),
    goToPage,
    nextPage,
    prevPage,
    setTotal,
    reset,
  };
}
