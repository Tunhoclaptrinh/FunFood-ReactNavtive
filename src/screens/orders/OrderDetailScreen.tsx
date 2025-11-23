import React, {useEffect, useState} from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  ActivityIndicator,
  SafeAreaView,
  Modal,
  TouchableOpacity,
  Alert,
} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {OrderService} from "@services/order.service";
import Button from "@/src/components/common/Button";
import Input from "@/src/components/common/Input/Input";
import EmptyState from "@/src/components/common/EmptyState/EmptyState";
import {formatCurrency} from "@utils/formatters";
import {COLORS} from "@/src/styles/colors";

interface RouteParams {
  orderId: number;
}

const ORDER_STATUSES = {
  pending: {label: "Pending", color: "#FFA500", icon: "time-outline"},
  confirmed: {label: "Confirmed", color: "#4ECDC4", icon: "checkmark-circle-outline"},
  preparing: {label: "Preparing", color: "#FFB800", icon: "pizza-outline"},
  delivering: {label: "Delivering", color: "#3498DB", icon: "car-outline"},
  delivered: {label: "Delivered", color: "#2ECC71", icon: "checkmark-done-outline"},
  cancelled: {label: "Cancelled", color: "#E74C3C", icon: "close-circle-outline"},
};

const PAYMENT_METHODS = {
  cash: "Cash on Delivery",
  card: "Credit Card",
  momo: "MoMo",
  zalopay: "ZaloPay",
};

const OrderDetailScreen = ({route, navigation}: any) => {
  const {orderId} = route.params as RouteParams;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    loadOrderData();
    // Refresh every 10 seconds
    const interval = setInterval(loadOrderData, 10000);
    return () => clearInterval(interval);
  }, [orderId]);

  const loadOrderData = async () => {
    try {
      setLoading(true);
      const res = await OrderService.getOrderById(orderId);
      setOrder(res);
    } catch (error) {
      console.error("Error loading order:", error);
      Alert.alert("Error", "Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = () => {
    Alert.alert("Cancel Order", "Are you sure you want to cancel this order?", [
      {text: "No", style: "cancel"},
      {
        text: "Yes, Cancel",
        onPress: async () => {
          setCancelling(true);
          try {
            await OrderService.cancelOrder(orderId);
            Alert.alert("Success", "Order cancelled successfully");
            await loadOrderData();
          } catch (error) {
            Alert.alert("Error", "Failed to cancel order");
          } finally {
            setCancelling(false);
          }
        },
        style: "destructive",
      },
    ]);
  };

  const handleRateOrder = async () => {
    if (!comment.trim()) {
      Alert.alert("Error", "Please add a comment");
      return;
    }

    setSubmittingRating(true);
    try {
      await OrderService.rateOrder(orderId, rating, comment);
      Alert.alert("Success", "Thank you for your rating!");
      setShowRatingModal(false);
      setComment("");
      setRating(5);
      await loadOrderData();
    } catch (error) {
      Alert.alert("Error", "Failed to submit rating");
    } finally {
      setSubmittingRating(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.container, styles.centered]}>
        <EmptyState icon="alert-outline" title="Order not found" subtitle="Please go back and try again" />
      </View>
    );
  }

  const statusInfo = ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES] || ORDER_STATUSES.pending;
  const canCancel = ["pending", "confirmed"].includes(order.status);
  const canRate = order.status === "delivered";

  const getStatusSteps = () => {
    const steps = [
      {status: "pending", label: "Order Placed"},
      {status: "confirmed", label: "Confirmed"},
      {status: "preparing", label: "Preparing"},
      {status: "delivering", label: "Delivering"},
      {status: "delivered", label: "Delivered"},
    ];

    const currentIndex = steps.findIndex((s) => s.status === order.status);
    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex && order.status !== "cancelled",
      current: index === currentIndex,
    }));
  };

  const steps = getStatusSteps();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Order Status Header */}
        <View style={styles.statusHeader}>
          <View style={[styles.statusBadge, {backgroundColor: statusInfo.color}]}>
            <Ionicons name={statusInfo.icon as any} size={24} color={COLORS.WHITE} />
            <Text style={styles.statusText}>{statusInfo.label}</Text>
          </View>
          <Text style={styles.orderId}>Order #{order.id}</Text>
          <Text style={styles.orderDate}>
            {new Date(order.createdAt).toLocaleDateString("vi-VN", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>

        {/* Status Timeline */}
        <View style={styles.timelineSection}>
          <Text style={styles.sectionTitle}>Order Status</Text>
          <View style={styles.timeline}>
            {steps.map((step, index) => (
              <View key={step.status} style={styles.timelineItem}>
                <View
                  style={[
                    styles.timelineCircle,
                    step.completed && styles.timelineCircleCompleted,
                    step.current && styles.timelineCircleCurrent,
                  ]}
                >
                  {step.completed && <Ionicons name="checkmark" size={16} color={COLORS.WHITE} />}
                </View>
                <Text style={[styles.timelineLabel, step.completed && styles.timelineLabelCompleted]}>
                  {step.label}
                </Text>
                {index < steps.length - 1 && (
                  <View style={[styles.timelineLine, steps[index + 1]?.completed && styles.timelineLineCompleted]} />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Items Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items</Text>
          {order.items?.map((item: any, index: number) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.productName}</Text>
                <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>{formatCurrency(item.price * item.quantity)}</Text>
            </View>
          ))}
        </View>

        {/* Delivery Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Information</Text>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color={COLORS.PRIMARY} />
            <Text style={styles.infoText}>{order.deliveryAddress}</Text>
          </View>
          {order.note && (
            <View style={styles.infoRow}>
              <Ionicons name="chatbubble-outline" size={20} color={COLORS.PRIMARY} />
              <Text style={styles.infoText}>{order.note}</Text>
            </View>
          )}
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentBox}>
            <Ionicons name="wallet-outline" size={24} color={COLORS.PRIMARY} />
            <Text style={styles.paymentText}>
              {PAYMENT_METHODS[order.paymentMethod as keyof typeof PAYMENT_METHODS] || order.paymentMethod}
            </Text>
          </View>
        </View>

        {/* Price Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(order.subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(order.deliveryFee)}</Text>
          </View>
          {order.discount > 0 && (
            <View style={[styles.summaryRow, styles.discountRow]}>
              <Text style={[styles.summaryLabel, styles.discountLabel]}>Discount:</Text>
              <Text style={[styles.summaryValue, styles.discountValue]}>-{formatCurrency(order.discount)}</Text>
            </View>
          )}
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>{formatCurrency(order.total)}</Text>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <View style={styles.buttonRow}>
          {canCancel && (
            <Button
              title="Cancel Order"
              onPress={handleCancelOrder}
              loading={cancelling}
              variant="outline"
              style={styles.cancelButton}
            />
          )}
          {canRate && <Button title="Rate Order" onPress={() => setShowRatingModal(true)} style={styles.rateButton} />}
        </View>
      </View>

      {/* Rating Modal */}
      <Modal
        visible={showRatingModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRatingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Rate This Order</Text>
              <TouchableOpacity onPress={() => setShowRatingModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.DARK} />
              </TouchableOpacity>
            </View>

            {/* Star Rating */}
            <View style={styles.starContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)} style={styles.starButton}>
                  <Ionicons name={star <= rating ? "star" : "star-outline"} size={40} color="#FFB800" />
                </TouchableOpacity>
              ))}
            </View>

            {/* Comment */}
            <Input
              label="Your Review"
              placeholder="Share your experience..."
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={4}
              containerStyle={styles.commentInput}
            />

            {/* Submit Button */}
            <Button
              title="Submit Rating"
              onPress={handleRateOrder}
              loading={submittingRating}
              style={styles.submitButton}
            />
          </View>
        </View>
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
  statusHeader: {
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 12,
    gap: 8,
  },
  statusText: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: "600",
  },
  orderId: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.DARK,
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: COLORS.GRAY,
  },
  timelineSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  timeline: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  timelineItem: {
    flex: 1,
    alignItems: "center",
  },
  timelineCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.LIGHT_GRAY,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  timelineCircleCompleted: {
    backgroundColor: COLORS.SUCCESS,
    borderColor: COLORS.SUCCESS,
  },
  timelineCircleCurrent: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
  timelineLabel: {
    fontSize: 10,
    color: COLORS.GRAY,
    textAlign: "center",
  },
  timelineLabelCompleted: {
    color: COLORS.DARK,
    fontWeight: "600",
  },
  timelineLine: {
    position: "absolute",
    height: 2,
    width: "100%",
    backgroundColor: COLORS.LIGHT_GRAY,
    top: 16,
    left: "50%",
    zIndex: -1,
  },
  timelineLineCompleted: {
    backgroundColor: COLORS.SUCCESS,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.DARK,
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.DARK,
  },
  itemQty: {
    fontSize: 12,
    color: COLORS.GRAY,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.PRIMARY,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.DARK,
    flex: 1,
    lineHeight: 20,
  },
  paymentBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.LIGHT_GRAY,
    padding: 12,
    borderRadius: 8,
    gap: 10,
  },
  paymentText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.DARK,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 13,
    color: COLORS.GRAY,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.DARK,
  },
  discountRow: {
    marginBottom: 10,
  },
  discountLabel: {
    color: COLORS.SUCCESS,
  },
  discountValue: {
    color: COLORS.SUCCESS,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: COLORS.LIGHT_GRAY,
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.DARK,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.PRIMARY,
  },
  bottomPadding: {
    height: 100,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.WHITE,
    borderTopWidth: 1,
    borderTopColor: COLORS.LIGHT_GRAY,
    elevation: 5,
    shadowColor: COLORS.BLACK,
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  rateButton: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    width: "100%",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.DARK,
  },
  starContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 16,
  },
  starButton: {
    padding: 4,
  },
  commentInput: {
    marginBottom: 16,
  },
  submitButton: {
    width: "100%",
  },
});

export default OrderDetailScreen;
