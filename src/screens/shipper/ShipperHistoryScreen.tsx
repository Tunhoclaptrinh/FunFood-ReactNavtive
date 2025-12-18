import React, {useCallback, useState} from "react";
import {View, StyleSheet, Text, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {useFocusEffect} from "@react-navigation/native";
import SafeAreaView from "@/src/components/common/SafeAreaView";
import EmptyState from "@/src/components/common/EmptyState/EmptyState";
import {ShipperService, ShipperOrder} from "@/src/services/shipper.service";
import {formatCurrency, formatDistance} from "@/src/utils/formatters";
import {COLORS} from "@/src/styles/colors";

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
        setOrders((prev) => [...prev, ...newOrders]);
      }

      setHasMore(res.pagination?.hasNext || false);
      setPage(pageNum);
    } catch (error) {
      console.error("Lỗi tải lịch sử:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadHistory(1);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading && !refreshing) {
      loadHistory(page + 1);
    }
  };

  const renderHistoryItem = ({item}: {item: ShipperOrder}) => (
    <View style={styles.card}>
      {/* Header: Date & Status */}
      <View style={styles.cardHeader}>
        <View style={styles.statusBadge}>
          <Ionicons name="checkmark-done-circle" size={16} color={COLORS.SUCCESS} />
          <Text style={styles.statusText}>Hoàn thành</Text>
        </View>
        <Text style={styles.idText}>#{item.id}</Text>
      </View>

      {/* Content */}
      <View style={styles.cardBody}>
        <View style={styles.row}>
          <Ionicons name="storefront-outline" size={16} color={COLORS.GRAY} />
          <Text style={styles.locationText} numberOfLines={1}>
            {item.restaurantName}
          </Text>
        </View>
        <View style={[styles.row, {marginTop: 6}]}>
          <Ionicons name="person-outline" size={16} color={COLORS.GRAY} />
          <Text style={styles.locationText} numberOfLines={1}>
            {item.customerName}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statsRow}>
          <Text style={styles.statText}>
            Thu nhập: <Text style={styles.money}>{formatCurrency(item.deliveryFee)}</Text>
          </Text>
          <Text style={styles.statText}>Tổng đơn: {formatCurrency(item.total)}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading && page === 1 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        </View>
      ) : orders.length === 0 ? (
        <EmptyState title="Chưa có lịch sử" subtitle="Các đơn hàng đã giao sẽ xuất hiện tại đây" icon="time-outline" />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderHistoryItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.PRIMARY]} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.WHITE},
  center: {flex: 1, justifyContent: "center", alignItems: "center"},
  list: {padding: 16},
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_GRAY,
    padding: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F8F5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  statusText: {fontSize: 12, color: COLORS.SUCCESS, fontWeight: "600"},
  idText: {fontSize: 14, fontWeight: "bold", color: COLORS.GRAY},
  cardBody: {gap: 4},
  row: {flexDirection: "row", alignItems: "center", gap: 8},
  locationText: {fontSize: 14, color: COLORS.DARK, flex: 1},
  divider: {height: 1, backgroundColor: COLORS.LIGHT_GRAY, marginVertical: 8},
  statsRow: {flexDirection: "row", justifyContent: "space-between"},
  statText: {fontSize: 13, color: COLORS.GRAY},
  money: {color: COLORS.PRIMARY, fontWeight: "bold"},
});

export default ShipperHistoryScreen;
