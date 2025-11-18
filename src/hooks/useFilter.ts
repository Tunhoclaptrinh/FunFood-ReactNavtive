import {useState, useCallback} from "react";
import {FilterState} from "@types/api.types";

export function useFilter(initialFilters: Record<string, any> = {}) {
  const [filters, setFilters] = useState<FilterState>({
    page: 1,
    limit: 10,
    filters: initialFilters,
  });

  const updateFilter = useCallback((key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      page: 1, // Reset to first page
      filters: {...prev.filters, [key]: value},
    }));
  }, []);

  const updateFilters = useCallback((newFilters: Record<string, any>) => {
    setFilters((prev) => ({
      ...prev,
      page: 1,
      filters: {...prev.filters, ...newFilters},
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      page: 1,
      limit: 10,
      filters: {},
    });
  }, []);

  const updatePagination = useCallback((page: number, limit: number) => {
    setFilters((prev) => ({...prev, page, limit}));
  }, []);

  return {
    ...filters,
    updateFilter,
    updateFilters,
    clearFilters,
    updatePagination,
  };
}
