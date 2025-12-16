/**
 * Shipper Order Card Component
 * Hiển thị thông tin đơn hàng available cho shipper
 */

import React from "react";
import {View, StyleSheet, Text, TouchableOpacity} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {ShipperOrder} from "@services/shipper.service";
import {formatCurrency, formatDistance} from "@utils/formatters";
import {COLORS} from "@/src/styles/colors";

interface ShipperOrderCardProps {
  order: ShipperOrder;
  onPress: (order: ShipperOrder) => void;
}

const ShipperOrderCard: React.FC<ShipperOrderCardProps> = ({order, onPress}) => {
  return (
    <TouchableOpacity 
      style={styles.orderCard} 
      onPress={() => onPress(order)} 
      activeOpacity={0.7}
    >
      {/* Restaurant Info */}
      <View style={styles.restaurantSection}>
        <View style={styles.restaurantInfo}>
          <Ionicons name="storefront-outline" size={20} color={COLORS.PRIMARY} />
          <View style={styles.restaurantText}>
            <Text style={styles.restaurantName}>{order.restaurantName}</Text>
            <Text style={styles.restaurantAddress} numberOfLines={1}>
              {order.restaurantAddress}
            </Text>
          </View>
        </View>
      </View>

      {/* Delivery Details */}
      <View style={styles.detailsSection}>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color={COLORS.GRAY} />
          <Text style={styles.detailText}>{order.deliveryAddress}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="car-outline" size={16} color={COLORS.GRAY} />
          <Text style={styles.detailText}>{formatDistance(order.distance)} away</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color={COLORS.GRAY} />
          <Text style={styles.detailText}>~{order.estimatedTime} min</Text>
        </View>
      </View>

      {/* Order Summary */}
      <View style={styles.summarySection}>
        <View style={styles.summaryRow}>
          <Text style={styles.itemCount}>{order.items.length} items</Text>
          <Text style={styles.orderTotal}>{formatCurrency(order.total)}</Text>
        </View>

        <View style={styles.earnings}>
          <Ionicons name="cash-outline" size={14} color={COLORS.SUCCESS} />
          <Text style={styles.earningsText}>Earn: {formatCurrency(order.deliveryFee)}</Text>
        </View>
      </View>

      {/* Tap to view */}
      <View style={styles.tapToView}>
        <Text style={styles.tapText}>Tap for details</Text>
        <Ionicons name="chevron-forward" size={16} color={COLORS.PRIMARY} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
});

export default ShipperOrderCard;
