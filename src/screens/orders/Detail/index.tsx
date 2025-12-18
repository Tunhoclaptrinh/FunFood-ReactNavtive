import React, {useEffect, useState} from "react";
import {View, ScrollView, StyleSheet, Text, ActivityIndicator, Modal, TouchableOpacity, Alert} from "react-native";
import SafeAreaView from "@/src/components/common/SafeAreaView";
import {Ionicons} from "@expo/vector-icons";
import {OrderService} from "@services/order.service";
import Button from "@/src/components/common/Button";
import Input from "@/src/components/common/Input/Input";
import EmptyState from "@/src/components/common/EmptyState/EmptyState";
import {formatCurrency} from "@utils/formatters";
import {COLORS} from "@/src/styles/colors";
import {ORDER_STATUSES, PAYMENT_METHODS} from "@/src/config/constants";
import styles from "./styles";

interface RouteParams {
  orderId: number;
}

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
  }, [orderId]);

  const loadOrderData = async () => {
    try {
      setLoading(true);
      const res = await OrderService.getOrderById(orderId);
      setOrder(res);
    } catch (error) {
      console.error("Error loading order:", error);
      Alert.alert("Lỗi", "Không thể tải thông tin đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = () => {
    Alert.alert("Hủy đơn hàng", "Bạn có chắc chắn muốn hủy đơn hàng này?", [
      {text: "Không", style: "cancel"},
      {
        text: "Có, Hủy đơn",
        onPress: async () => {
          setCancelling(true);
          try {
            await OrderService.cancelOrder(orderId);
            Alert.alert("Thành công", "Đơn hàng đã được hủy");
            await loadOrderData();
          } catch (error) {
            Alert.alert("Lỗi", "Không thể hủy đơn hàng");
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
      Alert.alert("Lỗi", "Vui lòng nhập nhận xét của bạn");
      return;
    }

    setSubmittingRating(true);
    try {
      await OrderService.rateOrder(orderId, rating, comment);
      Alert.alert("Thành công", "Cảm ơn bạn đã đánh giá!");
      setShowRatingModal(false);
      setComment("");
      setRating(5);
      await loadOrderData();
    } catch (error) {
      Alert.alert("Lỗi", "Không thể gửi đánh giá");
    } finally {
      setSubmittingRating(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.container, styles.centered]}>
        <EmptyState icon="alert-outline" title="Không tìm thấy đơn hàng" subtitle="Vui lòng quay lại và thử lại" />
      </View>
    );
  }

  // Map status sang thông tin hiển thị
  const STATUS_INFO: Record<string, {label: string; color: string; icon: string}> = {
    pending: {
      label: "Chờ xác nhận",
      color: "#F59E0B",
      icon: "time-outline",
    },
    confirmed: {
      label: "Đã xác nhận",
      color: "#3B82F6",
      icon: "checkmark-circle-outline",
    },
    preparing: {
      label: "Đang chuẩn bị",
      color: "#8B5CF6",
      icon: "restaurant-outline",
    },
    delivering: {
      label: "Đang giao",
      color: "#06B6D4",
      icon: "bicycle-outline",
    },
    on_the_way: {
      label: "Đang giao",
      color: "#06B6D4",
      icon: "bicycle-outline",
    },
    delivered: {
      label: "Đã giao",
      color: "#10B981",
      icon: "checkmark-done-circle-outline",
    },
    cancelled: {
      label: "Đã hủy",
      color: "#EF4444",
      icon: "close-circle-outline",
    },
  };

  const statusInfo = STATUS_INFO[order.status] || STATUS_INFO.pending;
  const canCancel = ["pending", "confirmed"].includes(order.status);
  const canRate = order.status === "delivered";

  const getStatusSteps = () => {
    // Nếu đơn hàng đã bị hủy, hiển thị timeline đơn giản
    if (order.status === "cancelled") {
      return [
        {status: "pending", label: "Đặt hàng", completed: true, current: false},
        {status: "cancelled", label: "Đã hủy", completed: true, current: true},
      ];
    }

    // Timeline bình thường cho các trạng thái khác
    const steps = [
      {status: "pending", label: "Đặt hàng"},
      {status: "confirmed", label: "Xác nhận"},
      {status: "preparing", label: "Chuẩn bị"},
      {status: "delivering", label: "Đang giao"},
      {status: "delivered", label: "Hoàn tất"},
    ];

    const currentIndex = steps.findIndex((s) => s.status === order.status);
    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex,
    }));
  };

  const steps = getStatusSteps();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Order Status Header - Improved */}
        <View style={styles.statusHeader}>
          <View style={[styles.statusBadge, {backgroundColor: statusInfo.color}]}>
            <Ionicons name={statusInfo.icon as any} size={28} color={COLORS.WHITE} />
          </View>
          <Text style={styles.statusText}>{statusInfo.label}</Text>
          <View style={styles.orderInfoBox}>
            <Text style={styles.orderId}>Đơn hàng #{order.id}</Text>
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

          {/* Hiển thị lý do hủy nếu đơn hàng bị hủy */}
          {order.status === "cancelled" && order.cancelReason && (
            <View style={styles.cancelReasonHeader}>
              <Ionicons name="information-circle" size={18} color="#DC2626" />
              <Text style={styles.cancelReasonHeaderText}>{order.cancelReason}</Text>
            </View>
          )}
        </View>

        {/* Status Timeline - Improved */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="time-outline" size={20} color={COLORS.PRIMARY} />
            <Text style={styles.cardTitle}>Trạng thái đơn hàng</Text>
          </View>
          <View style={styles.timeline}>
            {steps.map((step, index) => (
              <View key={step.status} style={styles.timelineItem}>
                <View style={styles.timelineContent}>
                  <View
                    style={[
                      styles.timelineCircle,
                      step.completed && styles.timelineCircleCompleted,
                      step.current && styles.timelineCircleCurrent,
                    ]}
                  >
                    {step.completed && <Ionicons name="checkmark" size={18} color={COLORS.WHITE} />}
                  </View>
                  <Text style={[styles.timelineLabel, step.completed && styles.timelineLabelCompleted]}>
                    {step.label}
                  </Text>
                </View>
                {index < steps.length - 1 && (
                  <View style={[styles.timelineLine, steps[index + 1]?.completed && styles.timelineLineCompleted]} />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Items Section - Improved */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="cart-outline" size={20} color={COLORS.PRIMARY} />
            <Text style={styles.cardTitle}>Sản phẩm</Text>
          </View>
          {order.items?.map((item: any, index: number) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.itemBadge}>
                <Text style={styles.itemQtyBadge}>{item.quantity}x</Text>
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.productName}</Text>
                <Text style={styles.itemUnitPrice}>{formatCurrency(item.price)}/sản phẩm</Text>
              </View>
              <Text style={styles.itemPrice}>{formatCurrency(item.price * item.quantity)}</Text>
            </View>
          ))}
        </View>

        {/* Delivery Info - Improved */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="location-outline" size={20} color={COLORS.PRIMARY} />
            <Text style={styles.cardTitle}>Thông tin giao hàng</Text>
          </View>
          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <Ionicons name="navigate-outline" size={18} color={COLORS.GRAY} />
              <Text style={styles.infoText}>{order.deliveryAddress}</Text>
            </View>
            {order.note && (
              <View style={[styles.infoRow, styles.noteRow]}>
                <Ionicons name="chatbubble-ellipses-outline" size={18} color={COLORS.GRAY} />
                <Text style={styles.infoText}>"{order.note}"</Text>
              </View>
            )}
          </View>
        </View>

        {/* Payment Method - Improved */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="card-outline" size={20} color={COLORS.PRIMARY} />
            <Text style={styles.cardTitle}>Phương thức thanh toán</Text>
          </View>
          <View style={styles.paymentBox}>
            <View style={styles.paymentIconBox}>
              <Ionicons name="wallet-outline" size={24} color={COLORS.PRIMARY} />
            </View>
            <Text style={styles.paymentText}>
              {PAYMENT_METHODS[order.paymentMethod as keyof typeof PAYMENT_METHODS] || order.paymentMethod}
            </Text>
          </View>
        </View>

        {/* Price Summary - Improved */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="receipt-outline" size={20} color={COLORS.PRIMARY} />
            <Text style={styles.cardTitle}>Chi tiết thanh toán</Text>
          </View>
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tạm tính</Text>
              <Text style={styles.summaryValue}>{formatCurrency(order.subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Phí giao hàng</Text>
              <Text style={styles.summaryValue}>{formatCurrency(order.deliveryFee)}</Text>
            </View>
            {order.discount > 0 && (
              <View style={[styles.summaryRow, styles.discountRow]}>
                <View style={styles.discountLabelBox}>
                  <Ionicons name="pricetag" size={14} color={COLORS.SUCCESS} />
                  <Text style={styles.discountLabel}>Giảm giá</Text>
                </View>
                <Text style={styles.discountValue}>-{formatCurrency(order.discount)}</Text>
              </View>
            )}
            <View style={styles.summaryDivider} />
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Tổng cộng</Text>
              <Text style={styles.totalValue}>{formatCurrency(order.total)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Action Buttons - Improved */}
      {(canCancel || canRate) && (
        <View style={styles.footer}>
          <View style={styles.buttonRow}>
            {canCancel && (
              <Button
                title="Hủy đơn hàng"
                onPress={handleCancelOrder}
                loading={cancelling}
                variant="outline"
                containerStyle={canRate ? styles.halfButton : styles.fullButton}
              />
            )}
            {canRate && (
              <Button
                title="Đánh giá"
                onPress={() => setShowRatingModal(true)}
                containerStyle={canCancel ? styles.halfButton : styles.fullButton}
              />
            )}
          </View>
        </View>
      )}

      {/* Rating Modal - Improved */}
      <Modal
        visible={showRatingModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRatingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Đánh giá đơn hàng</Text>
              <TouchableOpacity onPress={() => setShowRatingModal(false)} style={styles.closeButton}>
                <Ionicons name="close-circle" size={28} color={COLORS.GRAY} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>Bạn cảm thấy thế nào về đơn hàng này?</Text>

            {/* Star Rating */}
            <View style={styles.starContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  style={styles.starButton}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={star <= rating ? "star" : "star-outline"}
                    size={48}
                    color={star <= rating ? "#FFB800" : "#DDD"}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.ratingText}>
              {rating === 5
                ? "Tuyệt vời! ⭐"
                : rating === 4
                ? "Rất tốt! 👍"
                : rating === 3
                ? "Ổn 😊"
                : rating === 2
                ? "Cần cải thiện 😐"
                : "Không hài lòng 😞"}
            </Text>

            {/* Comment */}
            <Input
              label="Nhận xét của bạn"
              placeholder="Chia sẻ trải nghiệm của bạn về đơn hàng này..."
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={4}
              containerStyle={styles.commentInput}
            />

            {/* Submit Button */}
            <Button
              title="Gửi đánh giá"
              onPress={handleRateOrder}
              loading={submittingRating}
              containerStyle={styles.submitButton}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default OrderDetailScreen;
