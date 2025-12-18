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
// [NEW] Import thêm để lấy stats
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

// [NEW] Interface cho Stats để map dữ liệu chuẩn
interface OrderStats {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  shippingOrders: number;
  cancelledOrders: number;
  // Nếu backend sau này có preparingOrders thì thêm vào đây
  preparingOrders?: number;
}

type StatusFilter = "all" | "pending" | "confirmed" | "preparing" | "delivering" | "completed" | "cancelled";
type SortBy = "newest" | "oldest" | "highest" | "lowest";

const STATUS_TABS: {key: StatusFilter; label: string; icon: string}[] = [
  {key: "all", label: "Tất cả", icon: "albums"},
  {key: "pending", label: "Chờ xác nhận", icon: "time"},
  // Lưu ý: Nếu stats không có field preparing, ta có thể ẩn hoặc để 0
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
  // [NEW] Lấy user để gọi API stats
  const {user} = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // [NEW] State lưu thống kê chính xác từ Server
  const [stats, setStats] = useState<OrderStats | null>(null);

  // Filter & Sort States
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Animation
  const slideAnim = useRef(new Animated.Value(0)).current;
  const sortMenuAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (route.params?.initialTab !== undefined) {
      const tabKey = STATUS_TABS[route.params.initialTab]?.key || "all";
      setStatusFilter(tabKey);
    }
  }, [route.params]);

  useFocusEffect(
    React.useCallback(() => {
      loadOrders(1);
      fetchStats(); // [NEW] Gọi hàm lấy stats mỗi khi vào màn hình
    }, [])
  );

  // [NEW] Hàm lấy thống kê chuẩn từ Server (giống OrderStatsScreen)
  const fetchStats = async () => {
    if (!user) return;
    try {
      const response = await apiClient.get(`/users/${user.id}/activity`);
      const data = (response.data as {data: any}).data;

      // Map dữ liệu stats vào state
      setStats(data.stats || null);
    } catch (error) {
      console.error("Failed to fetch order stats", error);
    }
  };

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

  // Filter and sort orders (Client-side logic - chỉ lọc trên danh sách đã tải)
  // LƯU Ý: Để chính xác hoàn toàn, việc lọc status nên thực hiện ở Server (API params)
  // Nhưng ở đây ta giữ logic hiện tại cho danh sách hiển thị
  useEffect(() => {
    let filtered = [...orders];

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    filtered.sort((a, b) => {
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

    setFilteredOrders(filtered);
  }, [orders, statusFilter, sortBy]);

  const loadOrders = async (pageNum: number) => {
    try {
      if (pageNum === 1) setLoading(true);

      // Nếu API hỗ trợ lọc status, hãy truyền params vào đây: { page, limit, status: statusFilter }
      const res = await OrderService.getOrders(pageNum, 10);

      if (pageNum === 1) {
        setOrders(res.data || []);
      } else {
        setOrders([...orders, ...(res.data || [])]);
      }

      setHasMore(res.pagination?.hasNext || false);
      setPage(pageNum);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadOrders(1);
    fetchStats(); // [NEW] Refresh cả stats
  };

  const handleLoadMore = () => {
    if (hasMore && !loading && !refreshing) {
      loadOrders(page + 1);
    }
  };

  const handleOrderPress = (orderId: number) => {
    navigation.navigate("OrderDetail", {orderId});
  };

  const handleStatusFilterChange = (status: StatusFilter) => {
    setStatusFilter(status);
  };

  const handleSortChange = (sort: SortBy) => {
    setSortBy(sort);
    setShowSortMenu(false);
  };

  // [NEW] Helper lấy số lượng badge cho từng tab
  const getTabCount = (key: StatusFilter): number => {
    if (!stats) return 0;

    // Map key của Tab sang key của Stats Object
    switch (key) {
      case "all":
        return stats.totalOrders;
      case "pending":
        return stats.pendingOrders;
      case "delivering":
        return stats.shippingOrders; // Map 'delivering' sang 'shippingOrders'
      case "completed":
        return stats.completedOrders;
      case "cancelled":
        return stats.cancelledOrders;
      case "preparing":
        // Nếu API trả về preparingOrders thì dùng, không thì tạm thời để 0 hoặc gộp logic
        return stats.preparingOrders || 0;
      default:
        return 0;
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Title & Sort Button */}
      <View style={styles.titleRow}>
        <View>
          <Text style={styles.headerTitle}>Lọc đơn theo</Text>
          <Text style={styles.headerSubtitle}>
            {stats ? stats.totalOrders : filteredOrders.length} đơn hàng
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
            // [FIXED] Sử dụng count từ Server Stats thay vì đếm mảng local
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
                {/* Chỉ hiện badge nếu count > 0 */}
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

  const renderOrderCard = ({item, index}: {item: Order; index: number}) => {
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
  };

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
        data={filteredOrders}
        keyExtractor={(item) => item.id.toString()}
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
        onEndReachedThreshold={0.5}
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
          hasMore && !refreshing && filteredOrders.length > 0 ? (
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
