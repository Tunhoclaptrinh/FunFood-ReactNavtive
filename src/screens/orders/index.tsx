import React, {useEffect, useState, useRef, useCallback} from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Animated,
} from "react-native";
import SafeAreaView from "@/src/components/common/SafeAreaView";
import {Ionicons} from "@expo/vector-icons";
import {useFocusEffect} from "@react-navigation/native";
import {OrderService} from "@services/order.service";
import EmptyState from "@/src/components/common/EmptyState/EmptyState";
import {formatCurrency} from "@utils/formatters";
import {COLORS} from "@/src/styles/colors";
import {ORDER_STATUS_COLOR} from "@/src/styles/colors";
import {ORDER_STATUS_LABEL} from "@/src/config/constants";
import {useAuth} from "@hooks/useAuth";
import {apiClient} from "@config/api.client";
import styles from "./styles";

interface Order {
  id: number;
  status: string;
  total: number;
  createdAt: string;
  items: any[];
}

interface OrderStats {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  shippingOrders: number;
  cancelledOrders: number;
  preparingOrders?: number;
}

type StatusFilter = "all" | "pending" | "confirmed" | "preparing" | "delivering" | "completed" | "cancelled";
type SortBy = "newest" | "oldest" | "highest" | "lowest";

const STATUS_TABS: {key: StatusFilter; label: string; icon: string}[] = [
  {key: "all", label: "Tất cả", icon: "albums"},
  {key: "pending", label: "Chờ xác nhận", icon: "time"},
  {key: "preparing", label: "Đang chuẩn bị", icon: "restaurant"},
  {key: "delivering", label: "Đang giao", icon: "bicycle"},
  {key: "completed", label: "Hoàn thành", icon: "checkmark-circle"},
  {key: "cancelled", label: "Đã hủy", icon: "close-circle"},
];

const SORT_OPTIONS: {key: SortBy; label: string; icon: string}[] = [
  {key: "newest", label: "Mới nhất", icon: "arrow-down"},
  {key: "oldest", label: "Cũ nhất", icon: "arrow-up"},
  {key: "highest", label: "Giá cao nhất", icon: "trending-up"},
  {key: "lowest", label: "Giá thấp nhất", icon: "trending-down"},
];

const OrdersScreen = ({navigation, route}: any) => {
  const {user} = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [stats, setStats] = useState<OrderStats | null>(null);

  // Filter & Sort States
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Animation
  const slideAnim = useRef(new Animated.Value(0)).current;
  const sortMenuAnim = useRef(new Animated.Value(0)).current;

  // Ref để tránh load duplicate
  const isLoadingRef = useRef(false);
  const currentFilterRef = useRef(statusFilter);
  const currentSortRef = useRef(sortBy);

  useEffect(() => {
    if (route.params?.initialTab !== undefined) {
      const tabKey = STATUS_TABS[route.params.initialTab]?.key || "all";
      setStatusFilter(tabKey);
    }
  }, [route.params]);

  useFocusEffect(
    React.useCallback(() => {
      loadOrders(1, true);
      fetchStats();
    }, [])
  );

  // Animate status tab indicator
  useEffect(() => {
    const activeIndex = STATUS_TABS.findIndex((tab) => tab.key === statusFilter);
    const tabWidth = 100;

    Animated.spring(slideAnim, {
      toValue: activeIndex * tabWidth,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();
  }, [statusFilter]);

  // Animate sort menu
  useEffect(() => {
    Animated.timing(sortMenuAnim, {
      toValue: showSortMenu ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [showSortMenu]);

  // Khi filter hoặc sort thay đổi, reset và load lại
  useEffect(() => {
    if (currentFilterRef.current !== statusFilter || currentSortRef.current !== sortBy) {
      currentFilterRef.current = statusFilter;
      currentSortRef.current = sortBy;
      loadOrders(1, true);
    }
  }, [statusFilter, sortBy]);

  const fetchStats = async () => {
    if (!user) return;
    try {
      const response = await apiClient.get(`/users/${user.id}/activity`);
      const data = (response.data as {data: any}).data;
      setStats(data.stats || null);
    } catch (error) {
      console.error("Failed to fetch order stats", error);
    }
  };

  // Hàm sắp xếp orders
  const sortOrders = (ordersList: Order[]): Order[] => {
    const sorted = [...ordersList];
    sorted.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "highest":
          return b.total - a.total;
        case "lowest":
          return a.total - b.total;
        default:
          return 0;
      }
    });
    return sorted;
  };

  // Hàm lọc orders
  const filterOrders = (ordersList: Order[]): Order[] => {
    if (statusFilter === "all") return ordersList;
    return ordersList.filter((order) => order.status === statusFilter);
  };

  const loadOrders = async (pageNum: number, reset: boolean = false) => {
    // Prevent duplicate calls
    if (isLoadingRef.current) return;

    try {
      isLoadingRef.current = true;

      if (reset) {
        setLoading(true);
        setPage(1);
      } else {
        setLoadingMore(true);
      }

      // Gọi API với params lọc và sắp xếp nếu backend hỗ trợ
      // Hiện tại giữ nguyên, nhưng nên thêm params: status, sortBy
      const res = await OrderService.getOrders(pageNum, 10);

      let newOrders = res.data || [];

      // Apply filter và sort ở client side
      newOrders = filterOrders(newOrders);
      newOrders = sortOrders(newOrders);

      if (reset || pageNum === 1) {
        setOrders(newOrders);
      } else {
        // Merge và loại bỏ duplicate
        const mergedOrders = [...orders, ...newOrders];
        const uniqueOrders = mergedOrders.filter(
          (order, index, self) => index === self.findIndex((o) => o.id === order.id)
        );
        setOrders(sortOrders(uniqueOrders));
      }

      setHasMore(res.pagination?.hasNext || false);
      setPage(pageNum);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      isLoadingRef.current = false;
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadOrders(1, true);
    fetchStats();
  }, [statusFilter, sortBy]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !loading && !refreshing && !loadingMore && !isLoadingRef.current) {
      loadOrders(page + 1, false);
    }
  }, [hasMore, loading, refreshing, loadingMore, page]);

  const handleOrderPress = (orderId: number) => {
    navigation.navigate("OrderDetail", {orderId});
  };

  const handleStatusFilterChange = (status: StatusFilter) => {
    if (status === statusFilter) return;
    setStatusFilter(status);
  };

  const handleSortChange = (sort: SortBy) => {
    if (sort === sortBy) {
      setShowSortMenu(false);
      return;
    }
    setSortBy(sort);
    setShowSortMenu(false);
  };

  const getTabCount = (key: StatusFilter): number => {
    if (!stats) return 0;

    switch (key) {
      case "all":
        return stats.totalOrders;
      case "pending":
        return stats.pendingOrders;
      case "delivering":
        return stats.shippingOrders;
      case "completed":
        return stats.completedOrders;
      case "cancelled":
        return stats.cancelledOrders;
      case "preparing":
        return stats.preparingOrders || 0;
      default:
        return 0;
    }
  };

  // Memoize filtered orders để tránh re-render không cần thiết
  const displayOrders = React.useMemo(() => {
    return orders;
  }, [orders]);

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Title & Sort Button */}
      <View style={styles.titleRow}>
        <View>
          <Text style={styles.headerTitle}>Lọc đơn theo</Text>
          <Text style={styles.headerSubtitle}>
            {stats ? getTabCount(statusFilter) : displayOrders.length} đơn hàng
            {statusFilter !== "all" && ` • ${STATUS_TABS.find((t) => t.key === statusFilter)?.label}`}
          </Text>
        </View>

        <TouchableOpacity style={styles.sortButton} onPress={() => setShowSortMenu(!showSortMenu)} activeOpacity={0.7}>
          <Ionicons name="swap-vertical" size={20} color={COLORS.PRIMARY} />
          <Text style={styles.sortButtonText}>{SORT_OPTIONS.find((s) => s.key === sortBy)?.label}</Text>
        </TouchableOpacity>
      </View>

      {/* Sort Menu Dropdown */}
      {showSortMenu && (
        <Animated.View
          style={[
            styles.sortMenu,
            {
              opacity: sortMenuAnim,
              transform: [
                {
                  translateY: sortMenuAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-10, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {SORT_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[styles.sortMenuItem, sortBy === option.key && styles.sortMenuItemActive]}
              onPress={() => handleSortChange(option.key)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={option.icon as any}
                size={18}
                color={sortBy === option.key ? COLORS.PRIMARY : COLORS.GRAY}
              />
              <Text style={[styles.sortMenuText, sortBy === option.key && styles.sortMenuTextActive]}>
                {option.label}
              </Text>
              {sortBy === option.key && <Ionicons name="checkmark" size={18} color={COLORS.PRIMARY} />}
            </TouchableOpacity>
          ))}
        </Animated.View>
      )}

      {/* Status Filter Tabs */}
      <View style={styles.tabsContainer}>
        <FlatList
          data={STATUS_TABS}
          keyExtractor={(item) => item.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsList}
          renderItem={({item}) => {
            const isActive = statusFilter === item.key;
            const count = getTabCount(item.key);

            return (
              <TouchableOpacity
                style={[styles.tabItem, isActive && styles.tabItemActive]}
                onPress={() => handleStatusFilterChange(item.key)}
                activeOpacity={0.7}
              >
                <View style={[styles.tabIconContainer, isActive && styles.tabIconContainerActive]}>
                  <Ionicons name={item.icon as any} size={18} color={isActive ? COLORS.PRIMARY : COLORS.GRAY} />
                </View>
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{item.label}</Text>
                {count > 0 && (
                  <View style={[styles.tabBadge, isActive && styles.tabBadgeActive]}>
                    <Text style={[styles.tabBadgeText, isActive && styles.tabBadgeTextActive]}>{count}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </View>
  );

  const renderOrderCard = useCallback(({item, index}: {item: Order; index: number}) => {
    const statusColor = ORDER_STATUS_COLOR[item.status] || COLORS.GRAY;
    const statusLabel = ORDER_STATUS_LABEL[item.status] || item.status;
    const itemCount = item.items?.length || 0;

    return (
      <TouchableOpacity style={styles.orderCard} onPress={() => handleOrderPress(item.id)} activeOpacity={0.7}>
        <View style={styles.orderHeader}>
          <View style={styles.orderTitle}>
            <View style={styles.orderIdRow}>
              <Text style={styles.orderId}>Đơn hàng #{item.id}</Text>
              <View style={[styles.statusDot, {backgroundColor: statusColor}]} />
            </View>
            <Text style={styles.orderDate}>
              {new Date(item.createdAt).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>

          <View style={[styles.statusBadge, {backgroundColor: statusColor + "20", borderColor: statusColor}]}>
            <Text style={[styles.statusText, {color: statusColor}]}>{statusLabel}</Text>
          </View>
        </View>

        <View style={styles.orderBody}>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="bag-outline" size={16} color={COLORS.PRIMARY} />
            </View>
            <Text style={styles.infoText}>{itemCount} món</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="wallet-outline" size={16} color={COLORS.SUCCESS} />
            </View>
            <Text style={styles.totalAmount}>{formatCurrency(item.total)}</Text>
          </View>
        </View>

        <View style={styles.orderFooter}>
          <Text style={styles.tapText}>Xem chi tiết</Text>
          <Ionicons name="chevron-forward" size={18} color={COLORS.PRIMARY} />
        </View>
      </TouchableOpacity>
    );
  }, []);

  const keyExtractor = useCallback((item: Order) => `order-${item.id}`, []);

  if (loading && orders.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={[styles.container, styles.centered]}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ListHeaderComponent={renderHeader()}
        data={displayOrders}
        keyExtractor={keyExtractor}
        renderItem={renderOrderCard}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.PRIMARY]}
            tintColor={COLORS.PRIMARY}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={true}
        initialNumToRender={10}
        ListEmptyComponent={
          <EmptyState
            icon="document-outline"
            title={
              statusFilter === "all"
                ? "Chưa có đơn hàng"
                : `Không có đơn hàng ${STATUS_TABS.find((t) => t.key === statusFilter)?.label.toLowerCase()}`
            }
            subtitle={statusFilter === "all" ? "Bắt đầu đặt món yêu thích của bạn!" : "Thử chọn bộ lọc khác"}
            containerStyle={styles.emptyState}
          />
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.loadingFooter}>
              <ActivityIndicator size="small" color={COLORS.PRIMARY} />
              <Text style={styles.loadingFooterText}>Đang tải thêm...</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

export default OrdersScreen;
