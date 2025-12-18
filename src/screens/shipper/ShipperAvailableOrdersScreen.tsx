/**
 * Shipper Available Orders Screen - FIXED VERSION
 *
 * Improvements:
 * - Better error handling
 * - Smooth navigation
 * - Auto refresh after actions
 * - Loading states
 * - Better UX feedback
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
  Alert,
  Modal,
} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import SafeAreaView from "@/src/components/common/SafeAreaView";
import {useFocusEffect} from "@react-navigation/native";
import {ShipperService, ShipperOrder} from "@services/shipper.service";
import Button from "@/src/components/common/Button";
import Input from "@/src/components/common/Input/Input";
import EmptyState from "@/src/components/common/EmptyState/EmptyState";
import {formatCurrency, formatDistance} from "@utils/formatters";
import {COLORS} from "@/src/styles/colors";

const ShipperAvailableOrdersScreen = ({navigation}: any) => {
  // ============ STATE ============
  const [orders, setOrders] = useState<ShipperOrder[]>([]);
  const [allOrders, setAllOrders] = useState<ShipperOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Filter
  const [filterDistance, setFilterDistance] = useState("");
  const [debouncedFilter, setDebouncedFilter] = useState("");

  // Modal
  const [selectedOrder, setSelectedOrder] = useState<ShipperOrder | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [accepting, setAccepting] = useState(false);

  // ============ AUTO REFRESH ON FOCUS ============
  useFocusEffect(
    useCallback(() => {
      loadOrders(1);
    }, [])
  );

  // ============ DEBOUNCE FILTER ============
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilter(filterDistance);
    }, 300);
    return () => clearTimeout(timer);
  }, [filterDistance]);

  // ============ APPLY FILTER ============
  useEffect(() => {
    if (!debouncedFilter || debouncedFilter.trim() === "") {
      setOrders(allOrders);
      return;
    }

    const normalized = debouncedFilter.replace(",", ".");
    const maxDistance = parseFloat(normalized);

    if (isNaN(maxDistance) || maxDistance < 0) {
      setOrders(allOrders);
      return;
    }

    const filtered = allOrders.filter((order) => (order.distance ?? 0) <= maxDistance);
    setOrders(filtered);
  }, [debouncedFilter, allOrders]);

  // ============ LOAD ORDERS ============
  const loadOrders = async (pageNum: number, showLoading = true) => {
    try {
      if (pageNum === 1 && showLoading) {
        setLoading(true);
      }

      const res = await ShipperService.getAvailableOrders(pageNum, 15);
      const newOrders = res.data || [];

      if (pageNum === 1) {
        setAllOrders(newOrders);
        setOrders(newOrders);
      } else {
        setAllOrders((prev) => [...prev, ...newOrders]);
        setOrders((prev) => [...prev, ...newOrders]);
      }

      setHasMore(res.pagination?.hasNext || false);
      setPage(pageNum);
    } catch (error: any) {
      console.error("Error loading orders:", error);
      Alert.alert("Lỗi tải đơn hàng", error?.response?.data?.message || "Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ============ REFRESH ============
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setFilterDistance(""); // Clear filter khi refresh
    loadOrders(1);
  }, []);

  // ============ LOAD MORE ============
  const handleLoadMore = useCallback(() => {
    if (hasMore && !loading && !refreshing) {
      loadOrders(page + 1, false);
    }
  }, [hasMore, loading, refreshing, page]);

  // ============ FILTER CHANGE ============
  const handleFilterChange = (text: string) => {
    setFilterDistance(text);
  };

  // ============ CLEAR FILTER ============
  const handleClearFilter = () => {
    setFilterDistance("");
    setOrders(allOrders);
  };

  // ============ SELECT ORDER ============
  const handleSelectOrder = (order: ShipperOrder) => {
    setSelectedOrder(order);
    setShowDetails(true);
  };

  // ============ ACCEPT ORDER ============
  const handleAcceptOrder = async () => {
    if (!selectedOrder) return;

    setAccepting(true);
    try {
      await ShipperService.acceptOrder(selectedOrder.id);

      // Remove from current list
      const updatedAll = allOrders.filter((o) => o.id !== selectedOrder.id);
      const updatedFiltered = orders.filter((o) => o.id !== selectedOrder.id);
      setAllOrders(updatedAll);
      setOrders(updatedFiltered);

      // Close modal
      setShowDetails(false);

      // Success feedback
      Alert.alert(
        "✓ Nhận đơn thành công",
        `Đơn hàng #${selectedOrder.id}\n\nBạn sẽ kiếm được ${formatCurrency(selectedOrder.deliveryFee)}`,
        [
          {
            text: "Xem đơn đang giao",
            onPress: () => {
              // Navigate to Active tab
              const parent = navigation.getParent();
              if (parent) {
                parent.navigate("Active", {
                  screen: "ShipperDeliveries",
                });
              }
            },
          },
          {
            text: "Tiếp tục xem",
            style: "cancel",
          },
        ]
      );

      // Auto refresh list in background
      setTimeout(() => {
        loadOrders(1, false);
      }, 1000);
    } catch (error: any) {
      console.error("Accept order error:", error);
      Alert.alert("Lỗi nhận đơn", error?.response?.data?.message || "Không thể nhận đơn hàng này");
    } finally {
      setAccepting(false);
    }
  };

  // ============ RENDER ORDER CARD ============
  const renderOrderCard = ({item}: {item: ShipperOrder}) => (
    <TouchableOpacity style={styles.orderCard} onPress={() => handleSelectOrder(item)} activeOpacity={0.7}>
      {/* Restaurant Info */}
      <View style={styles.restaurantSection}>
        <View style={styles.restaurantInfo}>
          <Ionicons name="storefront-outline" size={20} color={COLORS.PRIMARY} />
          <View style={styles.restaurantText}>
            <Text style={styles.restaurantName}>{item.restaurantName}</Text>
            <Text style={styles.restaurantAddress} numberOfLines={1}>
              {item.restaurantAddress}
            </Text>
          </View>
        </View>
      </View>

      {/* Delivery Details */}
      <View style={styles.detailsSection}>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color={COLORS.GRAY} />
          <Text style={styles.detailText} numberOfLines={1}>
            {item.deliveryAddress}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="car-outline" size={16} color={COLORS.GRAY} />
          <Text style={styles.detailText}>
            {formatDistance(item.distance)} • ~{item.estimatedTime} phút
          </Text>
        </View>
      </View>

      {/* Order Summary */}
      <View style={styles.summarySection}>
        <View style={styles.summaryRow}>
          <Text style={styles.itemCount}>{item.items.length} món</Text>
          <Text style={styles.orderTotal}>{formatCurrency(item.total)}</Text>
        </View>

        <View style={styles.earnings}>
          <Ionicons name="cash-outline" size={14} color={COLORS.SUCCESS} />
          <Text style={styles.earningsText}>Thu nhập: {formatCurrency(item.deliveryFee)}</Text>
        </View>
      </View>

      {/* Tap to view */}
      <View style={styles.tapToView}>
        <Text style={styles.tapText}>Nhấn để xem chi tiết</Text>
        <Ionicons name="chevron-forward" size={16} color={COLORS.PRIMARY} />
      </View>
    </TouchableOpacity>
  );

  // ============ RENDER ============
  return (
    <SafeAreaView style={styles.container}>
      {/* Filter Bar */}
      <View style={styles.filterBar}>
        <Input
          placeholder="Lọc theo khoảng cách (km)"
          value={filterDistance}
          onChangeText={handleFilterChange}
          keyboardType="numeric"
          rightIcon={filterDistance ? "close-circle" : undefined}
          onRightIconPress={handleClearFilter}
          containerStyle={styles.filterInput}
        />
      </View>

      {/* Loading State */}
      {loading && orders.length === 0 ? (
        <View style={[styles.container, styles.centered]}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
        </View>
      ) : orders.length === 0 ? (
        /* Empty State */
        <View style={{flex: 1}}>
          <EmptyState
            icon="mail-outline"
            title={debouncedFilter ? `Không có đơn trong ${debouncedFilter} km` : "Chưa có đơn hàng"}
            subtitle={
              debouncedFilter ? "Thử tăng khoảng cách hoặc xóa bộ lọc" : "Kiểm tra lại sau hoặc điều chỉnh bộ lọc"
            }
            containerStyle={styles.emptyState}
          />
          {debouncedFilter && hasMore && (
            <View style={styles.emptyActions}>
              <Button title="Tải thêm đơn" onPress={() => loadOrders(page + 1, false)} size="small" />
              <Button title="Xóa bộ lọc" onPress={handleClearFilter} variant="outline" size="small" />
            </View>
          )}
        </View>
      ) : (
        /* List */
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderOrderCard}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.PRIMARY]} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={<Text style={styles.headerText}>Đơn hàng khả dụng ({orders.length})</Text>}
          ListFooterComponent={
            hasMore && !refreshing ? (
              <View style={styles.loadingFooter}>
                <ActivityIndicator size="small" color={COLORS.PRIMARY} />
              </View>
            ) : null
          }
        />
      )}

      {/* Order Details Modal */}
      <Modal visible={showDetails} transparent animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          {selectedOrder && (
            <>
              {/* Header */}
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowDetails(false)}>
                  <Ionicons name="close" size={24} color={COLORS.DARK} />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Chi tiết đơn hàng</Text>
                <View style={{width: 24}} />
              </View>

              {/* Content */}
              <View style={styles.modalContent}>
                {/* Order Info */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Thông tin đơn hàng</Text>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Mã đơn:</Text>
                    <Text style={styles.value}>#{selectedOrder.id}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Tổng tiền:</Text>
                    <Text style={styles.value}>{formatCurrency(selectedOrder.total)}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Thu nhập của bạn:</Text>
                    <Text style={[styles.value, styles.earnings]}>{formatCurrency(selectedOrder.deliveryFee)}</Text>
                  </View>
                </View>

                {/* Restaurant */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Lấy hàng tại</Text>
                  <Text style={styles.name}>{selectedOrder.restaurantName}</Text>
                  <Text style={styles.address}>{selectedOrder.restaurantAddress}</Text>
                </View>

                {/* Delivery */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Giao hàng đến</Text>
                  <Text style={styles.name}>{selectedOrder.customerName}</Text>
                  <Text style={styles.address}>{selectedOrder.deliveryAddress}</Text>
                </View>

                {/* Items */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Món hàng ({selectedOrder.items.length})</Text>
                  {selectedOrder.items.map((item, index) => (
                    <View key={index} style={styles.itemRow}>
                      <Text style={styles.itemName}>{item.productName}</Text>
                      <Text style={styles.itemQty}>x{item.quantity}</Text>
                    </View>
                  ))}
                </View>

                {/* Route Info */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Thông tin tuyến đường</Text>
                  <View style={styles.infoRow}>
                    <Ionicons name="car-outline" size={20} color={COLORS.PRIMARY} />
                    <View style={{flex: 1, marginLeft: 10}}>
                      <Text style={styles.label}>Khoảng cách</Text>
                      <Text style={styles.value}>{formatDistance(selectedOrder.distance)}</Text>
                    </View>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="time-outline" size={20} color={COLORS.PRIMARY} />
                    <View style={{flex: 1, marginLeft: 10}}>
                      <Text style={styles.label}>Thời gian ước tính</Text>
                      <Text style={styles.value}>~{selectedOrder.estimatedTime} phút</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Accept Button */}
              <View style={styles.modalFooter}>
                <Button
                  title={`Nhận đơn - ${formatCurrency(selectedOrder.deliveryFee)}`}
                  onPress={handleAcceptOrder}
                  loading={accepting}
                  disabled={accepting}
                  containerStyle={styles.acceptButton}
                />
              </View>
            </>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

// ============ STYLES ============
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  filterBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  filterInput: {
    marginVertical: 0,
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
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.GRAY,
  },
  loadingFooter: {
    paddingVertical: 16,
    alignItems: "center",
  },
  emptyState: {
    flex: 1,
  },
  emptyActions: {
    padding: 16,
    gap: 12,
  },
  orderCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_GRAY,
    overflow: "hidden",
  },
  restaurantSection: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
  },
  restaurantInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  restaurantText: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.DARK,
  },
  restaurantAddress: {
    fontSize: 12,
    color: COLORS.GRAY,
    marginTop: 2,
  },
  detailsSection: {
    padding: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 12,
    color: COLORS.GRAY,
    flex: 1,
  },
  summarySection: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  itemCount: {
    fontSize: 12,
    color: COLORS.GRAY,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.DARK,
  },
  earnings: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "#E8F8F5",
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  earningsText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.SUCCESS,
  },
  tapToView: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  tapText: {
    fontSize: 12,
    color: COLORS.GRAY,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.DARK,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.DARK,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    color: COLORS.GRAY,
  },
  value: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.DARK,
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.DARK,
    marginBottom: 4,
  },
  address: {
    fontSize: 13,
    color: COLORS.GRAY,
    lineHeight: 20,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
  },
  itemName: {
    fontSize: 13,
    color: COLORS.DARK,
    flex: 1,
  },
  itemQty: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.GRAY,
  },
  modalFooter: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.LIGHT_GRAY,
  },
  acceptButton: {
    width: "100%",
  },
});

export default ShipperAvailableOrdersScreen;
