import React, {useState, useEffect} from "react";
import {View, ScrollView, StyleSheet, Text, TouchableOpacity, ActivityIndicator, RefreshControl} from "react-native";
import SafeAreaView from "@/src/components/common/SafeAreaView";
import {Ionicons} from "@expo/vector-icons";
import {useAuth} from "@hooks/useAuth";
import {apiClient} from "@config/api.client";
import Button from "@/src/components/common/Button";
import {formatCurrency} from "@utils/formatters";
import {COLORS, ORDER_STATUS_COLOR} from "@/src/styles/colors";
import styles from "./styles";
import {ORDER_STATUS_LABEL} from "@/src/config/constants";

// Interface cập nhật khớp với Backend trả về
interface OrderStats {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number; // Mới thêm
  shippingOrders: number; // Mới thêm
  cancelledOrders: number; // Mới thêm
  totalSpent: number;
  avgOrderValue: number;
  totalReviews: number;
  avgRating: number;
  totalFavorites: number;
}

interface RecentOrder {
  id: number;
  restaurantName: string; // Backend trả về restaurantName hoặc cần map từ restaurantId
  total: number;
  status: string;
  createdAt: string;
}

const OrderStatsScreen = ({navigation}: any) => {
  const {user} = useAuth();
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await apiClient.get(`/users/${user.id}/activity`);
      const data = (response.data as {data: any}).data;

      // Map dữ liệu an toàn
      setStats(
        data.stats || {
          totalOrders: 0,
          completedOrders: 0,
          pendingOrders: 0,
          shippingOrders: 0,
          cancelledOrders: 0,
          totalSpent: 0,
          avgOrderValue: 0,
          totalReviews: 0,
          avgRating: 0,
          totalFavorites: 0,
        }
      );

      // Xử lý recentOrders (đảm bảo có restaurantName nếu backend trả về object)
      const formattedOrders = (data.recentOrders || []).map((order: any) => ({
        ...order,
        // Nếu backend chưa join bảng restaurant, hiển thị ID tạm hoặc "Nhà hàng"
        restaurantName: order.restaurant?.name || order.restaurantName || `Nhà hàng #${order.restaurantId}`,
      }));

      setRecentOrders(formattedOrders);
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Hàm điều hướng thông minh: 0 = Tab Đang xử lý, 1 = Tab Lịch sử
  const navigateToOrders = (tabIndex: number = 0) => {
    navigation.navigate("Orders", {initialTab: tabIndex});
  };

  const getStatusColor = (status: string) => ORDER_STATUS_COLOR[status] || COLORS.GRAY;

  const getStatusLabel = (status: string) => ORDER_STATUS_LABEL[status] || status;

  // Component thẻ thống kê nhỏ (Clickable)
  const StatGridItem = ({icon, title, value, color, tabIndex}: any) => (
    <TouchableOpacity style={styles.gridItem} onPress={() => navigateToOrders(tabIndex)} activeOpacity={0.7}>
      <View style={[styles.gridIcon, {backgroundColor: color + "20"}]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.gridValue}>{value || 0}</Text>
      <Text style={styles.gridTitle}>{title}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Đang tải thống kê...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.PRIMARY]}
            tintColor={COLORS.PRIMARY}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSubtitle}>Lịch sử và chi tiết chi tiêu của bạn</Text>
          </View>
        </View>

        {stats && (
          <>
            {/* 1. Tổng quan & Chi tiêu */}
            <View style={styles.summarySection}>
              <View style={styles.summaryCard}>
                <View style={[styles.summaryIcon, {backgroundColor: "#FFE5E5"}]}>
                  <Ionicons name="receipt-outline" size={32} color={COLORS.PRIMARY} />
                </View>
                <View style={styles.summaryContent}>
                  <Text style={styles.summaryValue}>{stats.totalOrders}</Text>
                  <Text style={styles.summaryLabel}>Tổng đơn hàng</Text>
                  <View style={styles.summarySubinfo}>
                    <Ionicons name="checkmark-circle" size={14} color={COLORS.SUCCESS} />
                    <Text style={styles.summarySubtext}>{stats.completedOrders} thành công</Text>
                  </View>
                </View>
              </View>

              <View style={styles.summaryCard}>
                <View style={[styles.summaryIcon, {backgroundColor: "#FFF8E1"}]}>
                  <Ionicons name="wallet-outline" size={32} color="#FFA000" />
                </View>
                <View style={styles.summaryContent}>
                  <Text style={styles.summaryValue}>{formatCurrency(stats.totalSpent)}</Text>
                  <Text style={styles.summaryLabel}>Tổng chi tiêu</Text>
                  <View style={styles.summarySubinfo}>
                    <Ionicons name="trending-up" size={14} color="#FFA000" />
                    <Text style={styles.summarySubtext}>TB {formatCurrency(stats.avgOrderValue)}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* 2. Grid Trạng thái (Clickable) - PHẦN MỚI THÊM */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Trạng thái đơn hàng</Text>
              <View style={styles.gridContainer}>
                <StatGridItem
                  icon="time-outline"
                  title="Chờ xác nhận"
                  value={stats.pendingOrders}
                  color={COLORS.WARNING}
                  tabIndex={0}
                />
                <StatGridItem
                  icon="bicycle-outline"
                  title="Đang giao"
                  value={stats.shippingOrders}
                  color={COLORS.INFO}
                  tabIndex={0}
                />
                <StatGridItem
                  icon="checkmark-circle-outline"
                  title="Hoàn thành"
                  value={stats.completedOrders}
                  color={COLORS.SUCCESS}
                  tabIndex={1}
                />
                <StatGridItem
                  icon="close-circle-outline"
                  title="Đã hủy"
                  value={stats.cancelledOrders}
                  color={COLORS.ERROR}
                  tabIndex={1}
                />
              </View>
            </View>

            {/* 3. Chỉ số hoạt động */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Chỉ số hoạt động</Text>
              <View style={styles.statsCard}>
                {/* Tỷ lệ hoàn thành */}
                <View style={styles.statRow}>
                  <View style={styles.statInfo}>
                    <Text style={styles.statLabel}>Tỷ lệ hoàn thành</Text>
                    <Text style={styles.statValue}>
                      {stats.totalOrders > 0 ? ((stats.completedOrders / stats.totalOrders) * 100).toFixed(1) : 0}%
                    </Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width: `${stats.totalOrders > 0 ? (stats.completedOrders / stats.totalOrders) * 100 : 0}%`,
                        },
                      ]}
                    />
                  </View>
                </View>

                <View style={styles.statDivider} />

                {/* Đánh giá */}
                <View style={styles.statRow}>
                  <View style={styles.statIconLabel}>
                    <Ionicons name="star" size={20} color="#FFB800" />
                    <Text style={styles.statLabel}>Đánh giá trung bình</Text>
                  </View>
                  <View style={styles.statRightContent}>
                    <Text style={[styles.statValue, {color: "#FFB800"}]}>{stats.avgRating.toFixed(1)}</Text>
                    <View style={styles.starsContainer}>
                      {Array.from({length: 5}).map((_, i) => (
                        <Ionicons
                          key={i}
                          name={i < Math.round(stats.avgRating) ? "star" : "star-outline"}
                          size={14}
                          color="#FFB800"
                        />
                      ))}
                    </View>
                  </View>
                </View>

                <View style={styles.statDivider} />

                {/* Yêu thích & Review */}
                <View style={styles.rowBetween}>
                  <View style={styles.miniStat}>
                    <Ionicons name="chatbox-outline" size={20} color={COLORS.INFO} style={{marginBottom: 4}} />
                    <Text style={styles.statLabel}>Đánh giá</Text>
                    <Text style={styles.statValue}>{stats.totalReviews}</Text>
                  </View>
                  <View style={styles.verticalDivider} />
                  <View style={styles.miniStat}>
                    <Ionicons name="heart" size={20} color="#E91E63" style={{marginBottom: 4}} />
                    <Text style={styles.statLabel}>Yêu thích</Text>
                    <Text style={styles.statValue}>{stats.totalFavorites}</Text>
                  </View>
                </View>
              </View>
            </View>
          </>
        )}

        {/* 4. Đơn hàng gần đây */}
        {recentOrders.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Đơn hàng gần đây</Text>
              <TouchableOpacity onPress={() => navigateToOrders(0)}>
                <Text style={styles.viewAllText}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>

            {recentOrders.slice(0, 5).map((order) => (
              <TouchableOpacity
                key={order.id}
                style={styles.orderCard}
                onPress={() => navigation.navigate("OrderDetail", {orderId: order.id})}
                activeOpacity={0.7}
              >
                <View style={styles.orderHeader}>
                  <View style={{flex: 1, marginRight: 8}}>
                    <Text style={styles.orderRestaurant} numberOfLines={1}>
                      {order.restaurantName}
                    </Text>
                    <Text style={styles.orderId}>Mã đơn #{order.id}</Text>
                  </View>
                  <View style={[styles.orderStatus, {backgroundColor: getStatusColor(order.status) + "20"}]}>
                    <Text style={[styles.orderStatusText, {color: getStatusColor(order.status)}]}>
                      {getStatusLabel(order.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.orderFooter}>
                  <Text style={styles.orderTotal}>{formatCurrency(order.total)}</Text>
                  <Text style={styles.orderDate}>
                    {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <Button
            title="Xem tất cả đơn"
            onPress={() => navigateToOrders(0)}
            variant="outline"
            containerStyle={styles.actionButton}
          />
          <Button
            title="Đặt món ngay"
            onPress={() => navigation.navigate("Home")}
            containerStyle={styles.actionButton}
          />
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default OrderStatsScreen;
