/**
 * Shipper Active Deliveries Screen
 * Quản lý các đơn đang giao, cập nhật status
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
import {useFocusEffect} from "@react-navigation/native";
import {ShipperService, ShipperOrder} from "@services/shipper.service";
import Button from "@/src/components/common/Button";
import EmptyState from "@/src/components/common/EmptyState/EmptyState";
import {formatCurrency, formatDistance} from "@utils/formatters";
import {COLORS} from "@/src/styles/colors";

const ShipperDeliveriesScreen = ({navigation}: any) => {
  const [orders, setOrders] = useState<ShipperOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<ShipperOrder | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Reload khi screen được focus
  useFocusEffect(
    useCallback(() => {
      loadDeliveries(1);
    }, [])
  );

  const loadDeliveries = async (pageNum: number) => {
    try {
      if (pageNum === 1) setLoading(true);

      const res = await ShipperService.getDeliveries(pageNum, 10);
      const newOrders = res.data || [];

      if (pageNum === 1) {
        setOrders(newOrders);
      } else {
        setOrders([...orders, ...newOrders]);
      }

      setHasMore(res.pagination?.hasNext || false);
      setPage(pageNum);
    } catch (error) {
      console.error("Error loading deliveries:", error);
      Alert.alert("Error", "Failed to load active deliveries");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadDeliveries(1);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !loading && !refreshing) {
      loadDeliveries(page + 1);
    }
  }, [hasMore, loading, refreshing, page]);

  const handleSelectOrder = (order: ShipperOrder) => {
    setSelectedOrder(order);
    setShowDetails(true);
  };

  const handleMarkAsDelivering = async () => {
    if (!selectedOrder) return;

    setUpdatingStatus(true);
    try {
      await ShipperService.updateDeliveryStatus(selectedOrder.id, "delivering");
      Alert.alert("Success", "Order marked as delivering");

      // Update local state
      const updated = orders.map((o) => (o.id === selectedOrder.id ? {...o, status: "delivering" as const} : o));
      setOrders(updated);
      setSelectedOrder({...selectedOrder, status: "delivering"});
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleMarkAsDelivered = async () => {
    if (!selectedOrder) return;

    Alert.alert("Confirm Delivery", "Mark this order as delivered?", [
      {text: "Cancel", style: "cancel"},
      {
        text: "Confirm",
        onPress: async () => {
          setUpdatingStatus(true);
          try {
            await ShipperService.updateDeliveryStatus(selectedOrder.id, "delivered");
            Alert.alert("Success", `Order #${selectedOrder.id} delivered!`);

            // Remove from active list
            setOrders(orders.filter((o) => o.id !== selectedOrder.id));
            setShowDetails(false);
          } catch (error: any) {
            Alert.alert("Error", error.response?.data?.message || "Failed to mark as delivered");
          } finally {
            setUpdatingStatus(false);
          }
        },
      },
    ]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "preparing":
        return "#FFB800";
      case "delivering":
        return "#3498DB";
      case "delivered":
        return "#2ECC71";
      default:
        return COLORS.GRAY;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "preparing":
        return "Preparing at restaurant";
      case "delivering":
        return "On the way";
      case "delivered":
        return "Delivered";
      default:
        return status;
    }
  };

  const renderDeliveryCard = ({item}: {item: ShipperOrder}) => (
    <TouchableOpacity style={styles.deliveryCard} onPress={() => handleSelectOrder(item)} activeOpacity={0.7}>
      {/* Status Badge */}
      <View style={[styles.statusBadge, {backgroundColor: getStatusColor(item.status)}]}>
        <Ionicons
          name={
            item.status === "preparing"
              ? "hourglass-outline"
              : item.status === "delivering"
              ? "car-outline"
              : "checkmark-circle-outline"
          }
          size={16}
          color={COLORS.WHITE}
        />
        <Text style={styles.statusLabel}>{getStatusLabel(item.status)}</Text>
      </View>

      {/* Order Info */}
      <View style={styles.infoSection}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>Order #{item.id}</Text>
          <Text style={styles.orderTotal}>{formatCurrency(item.total)}</Text>
        </View>

        {/* Restaurant */}
        <View style={styles.locationRow}>
          <Ionicons name="storefront-outline" size={16} color={COLORS.PRIMARY} />
          <View style={styles.locationText}>
            <Text style={styles.locationName}>{item.restaurantName}</Text>
            <Text style={styles.locationAddress} numberOfLines={1}>
              Restaurant
            </Text>
          </View>
        </View>

        {/* Delivery Location */}
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={16} color={COLORS.PRIMARY} />
          <View style={styles.locationText}>
            <Text style={styles.locationName}>{item.customerName}</Text>
            <Text style={styles.locationAddress} numberOfLines={1}>
              {item.deliveryAddress}
            </Text>
          </View>
        </View>

        {/* Distance & Time */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Ionicons name="car-outline" size={14} color={COLORS.GRAY} />
            <Text style={styles.statText}>{formatDistance(item.distance)}</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="time-outline" size={14} color={COLORS.GRAY} />
            <Text style={styles.statText}>~{item.estimatedTime}m</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="cash-outline" size={14} color={COLORS.SUCCESS} />
            <Text style={[styles.statText, styles.earnText]}>{formatCurrency(item.deliveryFee)}</Text>
          </View>
        </View>
      </View>

      {/* Items Count */}
      <View style={styles.itemsSection}>
        <Text style={styles.itemsText}>{item.items.length} items</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading && orders.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Loading deliveries...</Text>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState
          icon="checkmark-done-outline"
          title="No Active Deliveries"
          subtitle="Accept new orders to get started"
          containerStyle={styles.emptyState}
        />
        <View style={styles.emptyFooter}>
          <Button
            title="View Available Orders"
            onPress={() => navigation.navigate("ShipperAvailableOrders")}
            containerStyle={styles.button}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderDeliveryCard}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.PRIMARY]} />}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={<Text style={styles.headerText}>Active Deliveries</Text>}
        ListFooterComponent={
          hasMore && !refreshing ? (
            <View style={styles.loadingFooter}>
              <ActivityIndicator size="small" color={COLORS.PRIMARY} />
            </View>
          ) : null
        }
      />

      {/* Delivery Details Modal */}
      <Modal visible={showDetails} transparent animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          {selectedOrder && (
            <>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowDetails(false)}>
                  <Ionicons name="close" size={24} color={COLORS.DARK} />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Delivery Details</Text>
                <View style={{width: 24}} />
              </View>

              <View style={styles.modalContent}>
                {/* Current Status */}
                <View style={[styles.statusSection, {backgroundColor: getStatusColor(selectedOrder.status) + "20"}]}>
                  <Ionicons
                    name={
                      selectedOrder.status === "preparing"
                        ? "hourglass-outline"
                        : selectedOrder.status === "delivering"
                        ? "car-outline"
                        : "checkmark-circle-outline"
                    }
                    size={32}
                    color={getStatusColor(selectedOrder.status)}
                  />
                  <Text style={[styles.currentStatus, {color: getStatusColor(selectedOrder.status)}]}>
                    {getStatusLabel(selectedOrder.status)}
                  </Text>
                </View>

                {/* Order Information */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Order Information</Text>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Order ID</Text>
                    <Text style={styles.value}>#{selectedOrder.id}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Total Amount</Text>
                    <Text style={styles.value}>{formatCurrency(selectedOrder.total)}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.label}>Your Earnings</Text>
                    <Text style={[styles.value, styles.earning]}>{formatCurrency(selectedOrder.deliveryFee)}</Text>
                  </View>
                </View>

                {/* Restaurant Details */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Pick Up From</Text>
                  <Text style={styles.name}>{selectedOrder.restaurantName}</Text>
                  <Text style={styles.address}>{selectedOrder.restaurantAddress}</Text>
                </View>

                {/* Delivery Address */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Deliver To</Text>
                  <Text style={styles.name}>{selectedOrder.customerName}</Text>
                  <Text style={styles.address}>{selectedOrder.deliveryAddress}</Text>
                  {selectedOrder.deliveryLatitude && (
                    <View style={styles.coordinates}>
                      <Text style={styles.coordinatesText}>
                        📍 {selectedOrder.deliveryLatitude.toFixed(4)}, {selectedOrder.deliveryLongitude?.toFixed(4)}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Items */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Items ({selectedOrder.items.length})</Text>
                  {selectedOrder.items.map((item, index) => (
                    <View key={index} style={styles.itemRow}>
                      <Text style={styles.itemName}>{item.productName}</Text>
                      <View style={styles.itemQtyPrice}>
                        <Text style={styles.itemQty}>x{item.quantity}</Text>
                        <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Distance & Time */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Route Information</Text>
                  <View style={styles.routeInfo}>
                    <View style={styles.routeItem}>
                      <Ionicons name="car-outline" size={20} color={COLORS.PRIMARY} />
                      <View>
                        <Text style={styles.routeLabel}>Distance</Text>
                        <Text style={styles.routeValue}>{formatDistance(selectedOrder.distance)}</Text>
                      </View>
                    </View>
                    <View style={styles.routeItem}>
                      <Ionicons name="time-outline" size={20} color={COLORS.PRIMARY} />
                      <View>
                        <Text style={styles.routeLabel}>Est. Time</Text>
                        <Text style={styles.routeValue}>~{selectedOrder.estimatedTime} min</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.modalFooter}>
                <View style={styles.buttonsRow}>
                  {selectedOrder.status === "preparing" && (
                    <Button
                      title="Start Delivery"
                      onPress={handleMarkAsDelivering}
                      loading={updatingStatus}
                      containerStyle={styles.actionButton}
                    />
                  )}
                  {selectedOrder.status === "delivering" && (
                    <Button
                      title="Mark Delivered"
                      onPress={handleMarkAsDelivered}
                      loading={updatingStatus}
                      containerStyle={styles.actionButton}
                    />
                  )}
                </View>
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
  emptyFooter: {
    padding: 16,
  },
  button: {
    width: "100%",
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
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.GRAY,
  },
  deliveryCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_GRAY,
    overflow: "hidden",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
  },
  statusLabel: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: "600",
  },
  infoSection: {
    padding: 12,
    gap: 10,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.DARK,
  },
  orderTotal: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.PRIMARY,
  },
  locationRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  locationText: {
    flex: 1,
  },
  locationName: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.DARK,
  },
  locationAddress: {
    fontSize: 11,
    color: COLORS.GRAY,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  stat: {
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
  earnText: {
    color: COLORS.SUCCESS,
  },
  itemsSection: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.LIGHT_GRAY,
    alignItems: "center",
  },
  itemsText: {
    fontSize: 12,
    color: COLORS.GRAY,
    fontWeight: "500",
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
  statusSection: {
    alignItems: "center",
    paddingVertical: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  currentStatus: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 8,
  },
  section: {
    marginBottom: 16,
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
    marginBottom: 8,
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
  earning: {
    color: COLORS.SUCCESS,
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
    marginBottom: 8,
  },
  coordinates: {
    backgroundColor: COLORS.LIGHT_GRAY,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  coordinatesText: {
    fontSize: 12,
    color: COLORS.GRAY,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
  },
  itemName: {
    fontSize: 13,
    color: COLORS.DARK,
    flex: 1,
  },
  itemQtyPrice: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  itemQty: {
    fontSize: 12,
    color: COLORS.GRAY,
  },
  itemPrice: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.DARK,
  },
  routeInfo: {
    flexDirection: "row",
    gap: 12,
  },
  routeItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 8,
  },
  routeLabel: {
    fontSize: 11,
    color: COLORS.GRAY,
  },
  routeValue: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.DARK,
    marginTop: 2,
  },
  modalFooter: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.LIGHT_GRAY,
  },
  buttonsRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
});

export default ShipperDeliveriesScreen;
