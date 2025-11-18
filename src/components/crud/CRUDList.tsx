import React, {useEffect} from "react";
import {FlatList, View, StyleSheet} from "react-native";
import {useApi} from "@hooks/useApi";
import {usePagination} from "@hooks/usePagination";
import {useFilter} from "@hooks/useFilter";
import {ApiResponse, PaginatedResponse} from "@types/api.types";

import Loading from "../common/Loading";
import EmptyState from "../common/EmptyState";

interface CRUDListProps<T> {
  apiFunc: (options: any) => Promise<{data: ApiResponse<PaginatedResponse<T>>}>;
  renderItem: (item: T) => React.ReactElement;
  onRefresh?: () => void;
}

export const CRUDList = React.forwardRef<any, CRUDListProps<any>>(({apiFunc, renderItem, onRefresh}, ref) => {
  const pagination = usePagination();
  const filter = useFilter();

  const apiRunner = React.useCallback(async () => {
    const options = {
      page: pagination.page,
      limit: pagination.limit,
      ...filter.filters,
    };
    return apiFunc(options);
  }, [apiFunc, pagination.page, pagination.limit, filter.filters]);

  const {data: paginatedData, loading, error, execute} = useApi(apiRunner);

  useEffect(() => {
    // Trigger execute when dependencies change, including initial load
    execute();
  }, [execute]);

  useEffect(() => {
    if (paginatedData?.pagination) {
      pagination.setTotal(paginatedData.pagination.total);
    }
  }, [paginatedData, pagination.setTotal]);

  const listData = paginatedData?.data?.data || [];

  // Hiển thị Loading/Error/EmptyState chỉ khi không có dữ liệu
  if (loading && listData.length === 0) return <Loading />;
  if (error && listData.length === 0) return <EmptyState message={`Error: ${error}`} />;
  if (!loading && listData.length === 0) return <EmptyState message="No data found" />;

  return (
    <FlatList
      data={listData}
      renderItem={({item}) => renderItem(item)}
      keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
      onEndReached={() => {
        // Chỉ load trang tiếp theo nếu còn trang
        if (paginatedData?.pagination && paginatedData.pagination.hasNext) {
          pagination.nextPage();
        }
      }}
      onEndReachedThreshold={0.5}
      refreshing={loading}
      onRefresh={onRefresh || (() => execute())}
    />
  );
});
