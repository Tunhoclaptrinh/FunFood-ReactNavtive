import React, {useEffect, useState} from "react";
import {View, StyleSheet, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator} from "react-native";
import SafeAreaView from "@/src/components/common/SafeAreaView";
import {Ionicons} from "@expo/vector-icons";
import {useFocusEffect} from "@react-navigation/native";
import {OrderService} from "@services/order.service";
import EmptyState from "@/src/components/common/EmptyState/EmptyState";
import {formatCurrency} from "@utils/formatters";
import {ORDER_STATUS_LABELS} from "@/src/config/constants";
import {COLORS, ORDER_STATUS_COLORS} from "@/src/styles/colors";

interface Order {
  id: number;
  status: string;
  total: number;
  createdAt: string;
  items: any[];
}

const OrdersScreen = ({navigation}: any) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Load orders when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadOrders(1);
    }, [])
  );

  const loadOrders = async (pageNum: number) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      }
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
  };

  const handleLoadMore = () => {
    if (hasMore && !loading && !refreshing) {
      loadOrders(page + 1);
    }
  };

  const handleOrderPress = (orderId: number) => {
    navigation.navigate("OrderDetail", {orderId});
  };

  const renderOrderCard = ({item}: {item: Order}) => {
    const statusColor = ORDER_STATUS_COLORS[item.status] || COLORS.GRAY;
    const statusLabel = ORDER_STATUS_LABELS[item.status] || item.status;
    const itemCount = item.items?.length || 0;

    return (
      <TouchableOpacity style={styles.orderCard} onPress={() => handleOrderPress(item.id)} activeOpacity={0.7}>
        <View style={styles.orderHeader}>
          <View style={styles.orderTitle}>
            <Text style={styles.orderId}>Order #{item.id}</Text>
            <Text style={styles.orderDate}>
              {new Date(item.createdAt).toLocaleDateString("vi-VN", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>

          <View style={[styles.statusBadge, {backgroundColor: statusColor}]}>
            <Text style={styles.statusText}>{statusLabel}</Text>
          </View>
        </View>

        <View style={styles.orderBody}>
          <View style={styles.infoRow}>
            <Ionicons name="bag-outline" size={16} color={COLORS.GRAY} />
            <Text style={styles.infoText}>
              {itemCount} item{itemCount !== 1 ? "s" : ""}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="cash-outline" size={16} color={COLORS.GRAY} />
            <Text style={styles.infoText}>{formatCurrency(item.total)}</Text>
          </View>
        </View>

        <View style={styles.orderFooter}>
          <Text style={styles.tapText}>Tap to view details</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.PRIMARY} />
        </View>
      </TouchableOpacity>
    );
  };

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
          icon="document-outline"
          title="No Orders Yet"
          subtitle="Start ordering your favorite food!"
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
        ListFooterComponent={
          hasMore && !refreshing ? (
            <View style={styles.loadingFooter}>
              <ActivityIndicator size="small" color={COLORS.PRIMARY} />
              <Text style={styles.loadingText}>Loading more...</Text>
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
    flexGrow: 1,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.DARK,
    marginVertical: 12,
    marginBottom: 16,
  },
  orderCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.LIGHT_GRAY,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
  },
  orderTitle: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.DARK,
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: COLORS.GRAY,
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  statusText: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: "600",
  },
  orderBody: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.DARK,
    fontWeight: "500",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  tapText: {
    fontSize: 12,
    color: COLORS.GRAY,
  },
  loadingFooter: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: COLORS.GRAY,
  },
});

export default OrdersScreen;
