import {FlatListProps} from "react-native";

export interface BaseListProps<T> extends Omit<Partial<FlatListProps<T>>, "renderItem"> {
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

  // Empty state
  emptyIcon?: string;
  emptyTitle?: string;
  emptySubtitle?: string;
  emptyAction?: {
    label: string;
    onPress: () => void;
  };

  // Error state
  errorTitle?: string;
  errorSubtitle?: string;
  onRetry?: () => void;

  // Loading
  onEndReachedThreshold?: number;
  autoFetch?: boolean;

  // Skeleton
  renderSkeleton?: () => React.ReactElement;
  skeletonCount?: number;
}
