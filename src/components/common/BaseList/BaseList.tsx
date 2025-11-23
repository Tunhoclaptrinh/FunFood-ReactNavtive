import {useEffect} from "react";
import {FlatList, RefreshControl, View, StyleSheet, ActivityIndicator, Text} from "react-native";
import EmptyState from "../EmptyState/EmptyState";
import {COLORS} from "@/src/styles/colors";
import {BaseListProps} from "./types";
import {styles} from "./styles";

/**
 * Enhanced BaseList Component
 *
 * Features:
 * - Skeleton loading for initial load
 * - Pull-to-refresh
 * - Infinite scroll with load more indicator
 * - Empty state with actions
 * - Error state with retry button
 * - Auto fetch on mount
 * - Better UX with loading states
 *
 * Usage:
 * ```tsx
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
 *   emptyAction={{
 *     label: "Explore",
 *     onPress: () => navigation.navigate("Home")
 *   }}
 *   renderSkeleton={() => <RestaurantCardSkeleton />}
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
  emptyAction,
  errorTitle = "Something went wrong",
  errorSubtitle,
  onRetry,
  onEndReachedThreshold = 0.5,
  autoFetch = true,
  renderSkeleton,
  skeletonCount = 5,
  ...flatListProps
}: BaseListProps<T>) {
  // Auto fetch on mount
  useEffect(() => {
    if (autoFetch && items.length === 0 && !isLoading) {
      fetchAll();
    }
  }, [autoFetch]);

  // Default Skeleton
  const DefaultSkeleton = () => (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonImage} />
      <View style={styles.skeletonContent}>
        <View style={styles.skeletonTitle} />
        <View style={styles.skeletonSubtitle} />
        <View style={styles.skeletonDescription} />
      </View>
    </View>
  );

  // Skeleton Loading (initial load)
  const renderSkeletonList = () => {
    const SkeletonComponent = renderSkeleton || DefaultSkeleton;
    return (
      <View style={styles.container}>
        {ListHeaderComponent}
        {Array.from({length: skeletonCount}).map((_, index) => (
          <SkeletonComponent key={`skeleton-${index}`} />
        ))}
      </View>
    );
  };

  // Loading Footer (load more)
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
  if (error && items.length === 0 && !isLoading && !isRefreshing) {
    return (
      <View style={styles.container}>
        <EmptyState
          variant="error"
          title={errorTitle}
          subtitle={errorSubtitle || error}
          primaryAction={
            onRetry
              ? {
                  label: "Retry",
                  onPress: onRetry,
                  leftIcon: "refresh-outline",
                }
              : undefined
          }
        />
      </View>
    );
  }

  // Initial Loading with Skeleton
  if (isLoading && items.length === 0 && !isRefreshing) {
    return renderSkeletonList();
  }

  // Empty State
  if (items.length === 0 && !isLoading && !isRefreshing) {
    return (
      <View style={styles.container}>
        <EmptyState icon={emptyIcon as any} title={emptyTitle} subtitle={emptySubtitle} primaryAction={emptyAction} />
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

export default BaseList;
