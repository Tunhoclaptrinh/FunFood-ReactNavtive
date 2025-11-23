import React, {useState, useEffect} from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {useAuth} from "@hooks/useAuth";
import {apiClient} from "@config/api.client";
import Button from "@/src/components/common/Button";
import {formatCurrency} from "@utils/formatters";
import {COLORS} from "@config/constants";

interface OrderStats {
  totalOrders: number;
  completedOrders: number;
  totalSpent: number;
  avgOrderValue: number;
  totalReviews: number;
  avgRating: number;
  totalFavorites: number;
}

interface RecentOrder {
  id: number;
  restaurantName: string;
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

      setStats(
        data.stats || {
          totalOrders: 0,
          completedOrders: 0,
          totalSpent: 0,
          avgOrderValue: 0,
          totalReviews: 0,
          avgRating: 0,
          totalFavorites: 0,
        }
      );

      setRecentOrders(data.recentOrders || []);
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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "#FFA000",
      confirmed: "#4ECDC4",
      preparing: "#FFB800",
      delivering: "#3498DB",
      delivered: "#2ECC71",
      cancelled: "#E74C3C",
    };
    return colors[status] || COLORS.GRAY;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Pending",
      confirmed: "Confirmed",
      preparing: "Preparing",
      delivering: "Delivering",
      delivered: "Delivered",
      cancelled: "Cancelled",
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Loading statistics...</Text>
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
          <Text style={styles.headerTitle}>Order Statistics</Text>
          <Text style={styles.headerSubtitle}>Your ordering history & insights</Text>
        </View>

        {stats && (
          <>
            {/* Summary Cards */}
            <View style={styles.summarySection}>
              <View style={styles.summaryCard}>
                <View style={[styles.summaryIcon, {backgroundColor: "#FFE5E5"}]}>
                  <Ionicons name="receipt-outline" size={32} color={COLORS.PRIMARY} />
                </View>
                <View style={styles.summaryContent}>
                  <Text style={styles.summaryValue}>{stats.totalOrders}</Text>
                  <Text style={styles.summaryLabel}>Total Orders</Text>
                  <View style={styles.summarySubinfo}>
                    <Ionicons name="checkmark-circle" size={14} color={COLORS.SUCCESS} />
                    <Text style={styles.summarySubtext}>{stats.completedOrders} completed</Text>
                  </View>
                </View>
              </View>

              <View style={styles.summaryCard}>
                <View style={[styles.summaryIcon, {backgroundColor: "#FFF8E1"}]}>
                  <Ionicons name="wallet-outline" size={32} color="#FFA000" />
                </View>
                <View style={styles.summaryContent}>
                  <Text style={styles.summaryValue}>{formatCurrency(stats.totalSpent)}</Text>
                  <Text style={styles.summaryLabel}>Total Spent</Text>
                  <View style={styles.summarySubinfo}>
                    <Ionicons name="trending-up" size={14} color="#FFA000" />
                    <Text style={styles.summarySubtext}>Avg {formatCurrency(stats.avgOrderValue)}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Detailed Stats */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Performance Metrics</Text>
              <View style={styles.statsCard}>
                <View style={styles.statRow}>
                  <View style={styles.statInfo}>
                    <Text style={styles.statLabel}>Completion Rate</Text>
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

                <View style={styles.statRow}>
                  <View style={styles.statIconLabel}>
                    <Ionicons name="star" size={20} color="#FFB800" />
                    <Text style={styles.statLabel}>Average Rating</Text>
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

                <View style={styles.statRow}>
                  <View style={styles.statIconLabel}>
                    <Ionicons name="chatbox-outline" size={20} color={COLORS.INFO} />
                    <Text style={styles.statLabel}>Total Reviews</Text>
                  </View>
                  <Text style={styles.statValue}>{stats.totalReviews}</Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statRow}>
                  <View style={styles.statIconLabel}>
                    <Ionicons name="heart" size={20} color="#E91E63" />
                    <Text style={styles.statLabel}>Favorites</Text>
                  </View>
                  <Text style={styles.statValue}>{stats.totalFavorites}</Text>
                </View>
              </View>
            </View>

            {/* Spending Breakdown */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Spending Overview</Text>
              <View style={styles.spendingCard}>
                <View style={styles.spendingRow}>
                  <Text style={styles.spendingLabel}>Average Order Value</Text>
                  <Text style={styles.spendingValue}>{formatCurrency(stats.avgOrderValue)}</Text>
                </View>
                <View style={styles.spendingRow}>
                  <Text style={styles.spendingLabel}>Total Orders</Text>
                  <Text style={styles.spendingValue}>{stats.totalOrders}</Text>
                </View>
                <View style={styles.spendingDivider} />
                <View style={styles.spendingRow}>
                  <Text style={styles.spendingTotalLabel}>Total Spent</Text>
                  <Text style={styles.spendingTotalValue}>{formatCurrency(stats.totalSpent)}</Text>
                </View>
              </View>
            </View>
          </>
        )}

        {/* Recent Orders */}
        {recentOrders.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Orders</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Orders")}>
                <Text style={styles.viewAllText}>View All</Text>
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
                  <View>
                    <Text style={styles.orderRestaurant}>{order.restaurantName}</Text>
                    <Text style={styles.orderId}>Order #{order.id}</Text>
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
                      month: "short",
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
            title="View All Orders"
            onPress={() => navigation.navigate("Orders")}
            variant="outline"
            style={styles.actionButton}
          />
          <Button title="Order Again" onPress={() => navigation.navigate("Home")} style={styles.actionButton} />
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.GRAY,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: COLORS.WHITE,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.DARK,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.GRAY,
  },
  summarySection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  summaryCard: {
    flexDirection: "row",
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 16,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  summaryContent: {
    flex: 1,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.DARK,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 13,
    color: COLORS.GRAY,
    fontWeight: "500",
    marginBottom: 6,
  },
  summarySubinfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  summarySubtext: {
    fontSize: 12,
    color: COLORS.GRAY,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.DARK,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.PRIMARY,
  },
  statsCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statRow: {
    paddingVertical: 12,
  },
  statInfo: {
    marginBottom: 8,
  },
  statIconLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.GRAY,
    fontWeight: "500",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.DARK,
  },
  statRightContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  starsContainer: {
    flexDirection: "row",
    gap: 2,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: COLORS.SUCCESS,
    borderRadius: 4,
  },
  statDivider: {
    height: 1,
    backgroundColor: COLORS.LIGHT_GRAY,
    marginVertical: 4,
  },
  spendingCard: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  spendingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  spendingLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "500",
  },
  spendingValue: {
    fontSize: 14,
    color: COLORS.WHITE,
    fontWeight: "600",
  },
  spendingDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginVertical: 8,
  },
  spendingTotalLabel: {
    fontSize: 16,
    color: COLORS.WHITE,
    fontWeight: "bold",
  },
  spendingTotalValue: {
    fontSize: 20,
    color: COLORS.WHITE,
    fontWeight: "bold",
  },
  orderCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  orderRestaurant: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.DARK,
    marginBottom: 4,
  },
  orderId: {
    fontSize: 12,
    color: COLORS.GRAY,
  },
  orderStatus: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  orderStatusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.LIGHT_GRAY,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.PRIMARY,
  },
  orderDate: {
    fontSize: 12,
    color: COLORS.GRAY,
  },
  actionsSection: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
  },
  bottomPadding: {
    height: 24,
  },
});

export default OrderStatsScreen;
