import React, {useEffect} from "react";
import {FlatList, View, StyleSheet} from "react-native";
import {useApi} from "@hooks/useApi";
import {usePagination} from "@hooks/usePagination";
import {useFilter} from "@hooks/useFilter";
import {ApiResponse, PaginatedResponse} from "@types/api.types";
import {Loading} from "./Loading";
import {EmptyState} from "./EmptyState";

interface CRUDListProps<T> {
  apiFunc: (options: any) => Promise<{data: ApiResponse<any>}>;
  renderItem: (item: T) => React.ReactElement;
  onRefresh?: () => void;
}

export const CRUDList = React.forwardRef<any, CRUDListProps<any>>(({apiFunc, renderItem, onRefresh}, ref) => {
  const {data, loading, error, execute} = useApi(() => apiFunc({page: pagination.page, limit: pagination.limit}));
  const pagination = usePagination();
  const filter = useFilter();

  useEffect(() => {
    execute();
  }, []);

  useEffect(() => {
    if (data?.pagination) {
      pagination.setTotal(data.pagination.total);
    }
  }, [data]);

  if (loading) return <Loading />;
  if (error) return <EmptyState message="Error loading data" />;
  if (!data?.length) return <EmptyState message="No data found" />;

  return (
    <FlatList
      data={data}
      renderItem={({item}) => renderItem(item)}
      keyExtractor={(item) => item.id.toString()}
      onEndReached={() => pagination.nextPage()}
      onRefresh={onRefresh || (() => execute())}
    />
  );
});
