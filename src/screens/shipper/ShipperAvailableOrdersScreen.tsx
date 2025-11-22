/**
 * Shipper Available Orders Screen
 * Danh sách các đơn hàng chưa được nhận, ready to deliver
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
  Alert,
  Modal,
} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {ShipperService, ShipperOrder} from "@services/shipper.service";
import Button from "@components/common/Button";
import Input from "@components/common/Input";
import EmptyState from "@components/common/EmptyState";
import {formatCurrency, formatDistance} from "@utils/formatters";
import {COLORS} from "@config/constants";

const ShipperAvailableOrdersScreen = ({navigation}: any) => {
  const [orders, setOrders] = useState<ShipperOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<ShipperOrder | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [filterDistance, setFilterDistance] = useState("");

  useEffect(() => {
    loadOrders(1);
  }, []);

  const loadOrders = async (pageNum: number) => {
    try {
      if (pageNum === 1) setLoading(true);

      const res = await ShipperService.getAvailableOrders(pageNum, 15);
      const newOrders = res.data || [];

      // Filter by distance if needed
      let filtered = newOrders;
      if (filterDistance) {
        const maxDistance = parseFloat(filterDistance);
        filtered = newOrders.filter((order) => order.distance <= maxDistance);
      }

      if (pageNum === 1) {
        setOrders(filtered);
      } else {
        setOrders([...orders, ...filtered]);
      }

      setHasMore(res.pagination?.hasNext || false);
      setPage(pageNum);
    } catch (error) {
      console.error("Error loading orders:", error);
      Alert.alert("Error", "Failed to load available orders");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadOrders(1);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !loading && !refreshing) {
      loadOrders(page + 1);
    }
  }, [hasMore, loading, refreshing, page]);

  const handleSelectOrder = (order: ShipperOrder) => {
    setSelectedOrder(order);
    setShowDetails(true);
  };

  const handleAcceptOrder = async () => {
    if (!selectedOrder) return;

    setAccepting(true);
    try {
      await ShipperService.acceptOrder(selectedOrder.id);
      Alert.alert("Success", `Order #${selectedOrder.id} accepted! Proceed to restaurant.`, [
        {
          text: "View Delivery",
          onPress: () => {
            setShowDetails(false);
            navigation.navigate("ShipperDeliveries");
          },
        },
      ]);
      // Remove from available list
      setOrders(orders.filter((o) => o.id !== selectedOrder.id));
      setShowDetails(false);
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Failed to accept order");
    } finally {
      setAccepting(false);
    }
  };

  const handleFilterChange = (text: string) => {
    setFilterDistance(text);
    if (text) {
      const maxDistance = parseFloat(text);
      const filtered = orders.filter((order) => order.distance <= maxDistance);
      setOrders(filtered);
    } else {
      loadOrders(1);
    }
  };

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
          <Text style={styles.detailText}>{item.deliveryAddress}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="car-outline" size={16} color={COLORS.GRAY} />
          <Text style={styles.detailText}>{formatDistance(item.distance)} away</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color={COLORS.GRAY} />
          <Text style={styles.detailText}>~{item.estimatedTime} min</Text>
        </View>
      </View>

      {/* Order Summary */}
      <View style={styles.summarySection}>
        <View style={styles.summaryRow}>
          <Text style={styles.itemCount}>{item.items.length} items</Text>
          <Text style={styles.orderTotal}>{formatCurrency(item.total)}</Text>
        </View>

        <View style={styles.earnings}>
          <Ionicons name="cash-outline" size={14} color={COLORS.SUCCESS} />
          <Text style={styles.earningsText}>Earn: {formatCurrency(item.deliveryFee)}</Text>
        </View>
      </View>

      {/* Tap to view */}
      <View style={styles.tapToView}>
        <Text style={styles.tapText}>Tap for details</Text>
        <Ionicons name="chevron-forward" size={16} color={COLORS.PRIMARY} />
      </View>
    </TouchableOpacity>
  );

  if (loading && orders.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Loading available orders...</Text>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState
          icon="inbox-outline"
          title="No Orders Available"
          subtitle="Check back soon or adjust your filters"
          containerStyle={styles.emptyState}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Filter Bar */}
      <View style={styles.filterBar}>
        <Input
          placeholder="Max distance (km)"
          value={filterDistance}
          onChangeText={handleFilterChange}
          keyboardType="numeric"
          containerStyle={styles.filterInput}
        />
      </View>

      {/* Orders List */}
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderOrderCard}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.PRIMARY]} />}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={<Text style={styles.headerText}>Available Orders</Text>}
        ListFooterComponent={
          hasMore && !refreshing ? (
            <View style={styles.loadingFooter}>
              <ActivityIndicator size="small" color={COLORS.PRIMARY} />
            </View>
          ) : null
        }
      />

      {/* Order Details Modal */}
      <Modal visible={showDetails} transparent animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          {selectedOrder && (
            <>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowDetails(false)}>
                  <Ionicons name="close" size={24} color={COLORS.DARK} />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Order Details</Text>
                <View style={{width: 24}} />
              </View>

              <View style={styles.modalContent}>
                {/* Order ID */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Order Information</Text>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Order ID:</Text>
                    <Text style={styles.value}>#{selectedOrder.id}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Total:</Text>
                    <Text style={styles.value}>{formatCurrency(selectedOrder.total)}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Your Earnings:</Text>
                    <Text style={[styles.value, styles.earnings]}>{formatCurrency(selectedOrder.deliveryFee)}</Text>
                  </View>
                </View>

                {/* Restaurant */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Restaurant</Text>
                  <Text style={styles.name}>{selectedOrder.restaurantName}</Text>
                  <Text style={styles.address}>{selectedOrder.restaurantAddress}</Text>
                </View>

                {/* Delivery Address */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Delivery Address</Text>
                  <Text style={styles.name}>{selectedOrder.customerName}</Text>
                  <Text style={styles.address}>{selectedOrder.deliveryAddress}</Text>
                </View>

                {/* Items */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Items ({selectedOrder.items.length})</Text>
                  {selectedOrder.items.map((item, index) => (
                    <View key={index} style={styles.itemRow}>
                      <Text style={styles.itemName}>{item.productName}</Text>
                      <Text style={styles.itemQty}>x{item.quantity}</Text>
                    </View>
                  ))}
                </View>

                {/* Distance & Time */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Delivery Details</Text>
                  <View style={styles.infoRow}>
                    <Ionicons name="car-outline" size={20} color={COLORS.PRIMARY} />
                    <View style={{flex: 1, marginLeft: 10}}>
                      <Text style={styles.label}>Distance</Text>
                      <Text style={styles.value}>{formatDistance(selectedOrder.distance)}</Text>
                    </View>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="time-outline" size={20} color={COLORS.PRIMARY} />
                    <View style={{flex: 1, marginLeft: 10}}>
                      <Text style={styles.label}>Estimated Time</Text>
                      <Text style={styles.value}>~{selectedOrder.estimatedTime} minutes</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Accept Button */}
              <View style={styles.modalFooter}>
                <Button
                  title={`Accept Order - ${formatCurrency(selectedOrder.deliveryFee)}`}
                  onPress={handleAcceptOrder}
                  loading={accepting}
                  style={styles.acceptButton}
                />
              </View>
            </>
          )}
        </SafeAreaView>
      </Modal>
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
  loadingFooter: {
    paddingVertical: 16,
    alignItems: "center",
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
  loadingText: {
    marginTop: 12,
    fontSize: 14,
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
