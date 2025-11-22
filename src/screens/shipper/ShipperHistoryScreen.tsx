/**
 * Shipper Delivery History Screen
 * Lịch sử các đơn hàng đã giao
 */

import React, {useEffect, useState, useCallback} from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {useFocusEffect} from "@react-navigation/native";
import {ShipperService, ShipperOrder} from "@services/shipper.service";
import EmptyState from "@components/common/EmptyState";
import {formatCurrency, formatDistance} from "@utils/formatters";
import {COLORS} from "@config/constants";

const ShipperHistoryScreen = ({navigation}: any) => {
  const [orders, setOrders] = useState<ShipperOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadHistory(1);
    }, [])
  );

  const loadHistory = async (pageNum: number) => {
    try {
      if (pageNum === 1) setLoading(true);

      const res = await ShipperService.getDeliveryHistory(pageNum, 15);
      const newOrders = res.data || [];

      if (pageNum === 1) {
        setOrders(newOrders);
      } else {
        setOrders([...orders, ...newOrders]);
      }

      setHasMore(res.pagination?.hasNext || false);
      setPage(pageNum);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadHistory(1);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !loading && !refreshing) {
      loadHistory(page + 1);
    }
  }, [hasMore, loading, refreshing, page]);

  const renderHistoryCard = ({item}: {item: ShipperOrder}) => (
    <TouchableOpacity style={styles.historyCard} activeOpacity={0.7}>
      {/* Order Header */}
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderId}>Order #{item.id}</Text>
          <Text style={styles.orderDate}>Delivered</Text>
        </View>
        <View style={styles.earnBadge}>
          <Ionicons name="cash-outline" size={16} color={COLORS.SUCCESS} />
          <Text style={styles.earnAmount}>{formatCurrency(item.deliveryFee)}</Text>
        </View>
      </View>

      {/* Route Info */}
      <View style={styles.routeInfo}>
        <View style={styles.routePoint}>
          <View style={[styles.routeDot, {backgroundColor: COLORS.PRIMARY}]} />
          <View style={styles.routeDetails}>
            <Text style={styles.routeLabel}>From</Text>
            <Text style={styles.routeName} numberOfLines={1}>
              {item.restaurantName}
            </Text>
          </View>
        </View>

        <View style={styles.routeLine} />

        <View style={styles.routePoint}>
          <View style={[styles.routeDot, {backgroundColor: COLORS.SUCCESS}]} />
          <View style={styles.routeDetails}>
            <Text style={styles.routeLabel}>To</Text>
            <Text style={styles.routeName} numberOfLines={1}>
              {item.customerName}
            </Text>
          </View>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ionicons name="car-outline" size={14} color={COLORS.GRAY} />
          <Text style={styles.statText}>{formatDistance(item.distance)}</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="time-outline" size={14} color={COLORS.GRAY} />
          <Text style={styles.statText}>{item.estimatedTime}m</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="cash-outline" size={14} color={COLORS.SUCCESS} />
          <Text style={styles.statText}>{formatCurrency(item.total)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading && orders.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState
          icon="time-outline"
          title="No Delivery History"
          subtitle="Your completed deliveries will appear here"
          containerStyle={styles.emptyState}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderHistoryCard}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.PRIMARY]} />}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={<Text style={styles.headerText}>Delivery History</Text>}
        ListFooterComponent={
          hasMore && !refreshing ? (
            <View style={styles.loadingFooter}>
              <ActivityIndicator size="small" color={COLORS.PRIMARY} />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.DARK,
    marginVertical: 12,
    marginBottom: 16,
  },
  loadingFooter: {
    paddingVertical: 16,
    alignItems: "center",
  },
  historyCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_GRAY,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
  },
  orderId: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.DARK,
  },
  orderDate: {
    fontSize: 12,
    color: COLORS.GRAY,
    marginTop: 2,
  },
  earnBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F8F5",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  earnAmount: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.SUCCESS,
  },
  routeInfo: {
    marginBottom: 12,
  },
  routePoint: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
    gap: 10,
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  routeDetails: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 10,
    color: COLORS.GRAY,
    fontWeight: "500",
  },
  routeName: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.DARK,
    marginTop: 2,
  },
  routeLine: {
    width: 2,
    height: 24,
    backgroundColor: COLORS.LIGHT_GRAY,
    marginLeft: 5,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.LIGHT_GRAY,
  },
  statItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 11,
    color: COLORS.GRAY,
    fontWeight: "500",
  },
});

export default ShipperHistoryScreen;
