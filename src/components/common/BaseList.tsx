import React, {useEffect} from "react";
import {FlatList, RefreshControl, View, StyleSheet, ActivityIndicator, Text, FlatListProps} from "react-native";
import EmptyState from "./EmptyState";
import {COLORS} from "@/src/config/constants";

interface BaseListProps<T> extends Omit<Partial<FlatListProps<T>>, "renderItem"> {
  // Store state
  items: T[];
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;

  // Store actions
  fetchAll: () => Promise<void>;
  fetchMore: () => Promise<void>;
  refresh: () => Promise<void>;

  // Render props
  renderItem: (item: T, index: number) => React.ReactElement;
  keyExtractor: (item: T, index: number) => string;

  // Optional props
  ListHeaderComponent?: React.ReactElement;
  ListFooterComponent?: React.ReactElement;
  emptyIcon?: string;
  emptyTitle?: string;
  emptySubtitle?: string;
  onEndReachedThreshold?: number;
  autoFetch?: boolean; // Auto fetch on mount (default: true)
}

/**
 * Reusable Base List Component
 *
 * Features:
 * - Initial loading state
 * - Pull-to-refresh
 * - Infinite scroll (load more)
 * - Empty state
 * - Error state
 * - Loading footer
 * - Auto fetch on mount
 *
 * Usage:
 * ```tsx
 * const { items, isLoading, isRefreshing, isLoadingMore, error, hasMore, fetchAll, fetchMore, refresh } = useRestaurantStore();
 *
 * <BaseList
 *   items={items}
 *   isLoading={isLoading}
 *   isRefreshing={isRefreshing}
 *   isLoadingMore={isLoadingMore}
 *   error={error}
 *   hasMore={hasMore}
 *   fetchAll={fetchAll}
 *   fetchMore={fetchMore}
 *   refresh={refresh}
 *   renderItem={(item) => <RestaurantCard restaurant={item} />}
 *   keyExtractor={(item) => item.id.toString()}
 *   emptyTitle="No restaurants found"
 *   emptySubtitle="Try a different search"
 * />
 * ```
 */
function BaseList<T>({
  items,
  isLoading,
  isRefreshing,
  isLoadingMore,
  error,
  hasMore,
  fetchAll,
  fetchMore,
  refresh,
  renderItem,
  keyExtractor,
  ListHeaderComponent,
  ListFooterComponent,
  emptyIcon = "alert-outline",
  emptyTitle = "No items found",
  emptySubtitle,
  onEndReachedThreshold = 0.5,
  autoFetch = true,
  ...flatListProps
}: BaseListProps<T>) {
  // Auto fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchAll();
    }
  }, []);

  // Loading Footer
  const renderLoadingFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Loading more...</Text>
      </View>
    );
  };

  // Error State
  if (error && items.length === 0 && !isLoading) {
    return (
      <View style={styles.container}>
        <EmptyState icon="alert-circle-outline" title="Error" subtitle={error} />
      </View>
    );
  }

  // Loading State (initial)
  if (isLoading && items.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Empty State
  if (items.length === 0 && !isLoading) {
    return (
      <View style={styles.container}>
        <EmptyState icon={emptyIcon as any} title={emptyTitle} subtitle={emptySubtitle} />
      </View>
    );
  }

  // List with data
  return (
    <FlatList
      data={items}
      renderItem={({item, index}) => renderItem(item, index)}
      keyExtractor={keyExtractor}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={refresh}
          colors={[COLORS.PRIMARY]}
          tintColor={COLORS.PRIMARY}
        />
      }
      onEndReached={hasMore ? fetchMore : undefined}
      onEndReachedThreshold={onEndReachedThreshold}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent || renderLoadingFooter()}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      {...flatListProps}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.WHITE,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.GRAY,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  loadingFooter: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    gap: 8,
  },
});

export default BaseList;
