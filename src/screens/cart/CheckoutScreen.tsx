import React, {useEffect, useState} from "react";
import {View, ScrollView, StyleSheet, Text, TouchableOpacity, Alert, ActivityIndicator, Modal} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {useCart} from "@hooks/useCart";
import {OrderService} from "@services/order.service";
import {PromotionService} from "@services/promotion.service";
import {useGeolocation} from "@hooks/useGeolocation";
import Input from "@/src/components/common/Input/Input";
import Button from "@/src/components/common/Button";
import {formatCurrency} from "@utils/formatters";
import {calculateDeliveryFee} from "@utils/gps";
import {COLORS} from "@/src/styles/colors";
import SafeAreaView from "@/src/components/common/SafeAreaView";

const PAYMENT_METHODS = [
  {id: "cash", label: "Cash on Delivery", icon: "cash-outline"},
  {id: "card", label: "Credit Card", icon: "card-outline"},
  {id: "momo", label: "MoMo", icon: "wallet-outline"},
  {id: "zalopay", label: "ZaloPay", icon: "wallet-outline"},
];

const CheckoutScreen = ({navigation}: any) => {
  const {items, totalPrice, clearCart} = useCart();
  const {location} = useGeolocation();

  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [note, setNote] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [discount, setDiscount] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(15000);
  const [loading, setLoading] = useState(false);
  const [validatingPromo, setValidatingPromo] = useState(false);

  // Get restaurant ID from first item
  const restaurantId = items[0]?.product?.restaurantId;

  useEffect(() => {
    // Calculate default delivery fee
    calculateDefaultDeliveryFee();
  }, []);

  const calculateDefaultDeliveryFee = () => {
    // Default delivery fee for now
    setDeliveryFee(15000);
  };

  const handleValidatePromo = async () => {
    if (!promoCode.trim()) {
      Alert.alert("Error", "Please enter a promotion code");
      return;
    }

    setValidatingPromo(true);
    try {
      const result = await PromotionService.validatePromotion(promoCode, totalPrice, deliveryFee);

      if (result.success || result.data) {
        const discountAmount = result.data?.discount || result.calculation?.discount || 0;
        setDiscount(discountAmount);
        Alert.alert("Promotion Applied!", `Discount: ${formatCurrency(discountAmount)}`);
      }
    } catch (error: any) {
      console.error("Promo validation error:", error);
      Alert.alert("Invalid Code", "Promotion code is not valid or expired");
      setDiscount(0);
      setPromoCode("");
    } finally {
      setValidatingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setPromoCode("");
    setDiscount(0);
  };

  const validateForm = () => {
    if (items.length === 0) {
      Alert.alert("Error", "Your cart is empty");
      return false;
    }

    if (!restaurantId) {
      Alert.alert("Error", "Invalid restaurant");
      return false;
    }

    if (!deliveryAddress.trim()) {
      Alert.alert("Error", "Please enter delivery address");
      return false;
    }

    if (!recipientName.trim()) {
      Alert.alert("Error", "Please enter recipient name");
      return false;
    }

    if (!recipientPhone.trim()) {
      Alert.alert("Error", "Please enter recipient phone");
      return false;
    }

    if (!paymentMethod) {
      Alert.alert("Error", "Please select payment method");
      return false;
    }

    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (!restaurantId) {
        Alert.alert("Error", "Invalid restaurant ID");
        setLoading(false);
        return;
      }

      const orderData = {
        restaurantId,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        deliveryAddress,
        paymentMethod,
        note: note || undefined,
        promotionCode: promoCode || undefined,
        deliveryLatitude: location?.latitude,
        deliveryLongitude: location?.longitude,
      };

      console.log("Placing order:", orderData);

      const result = await OrderService.createOrder(orderData as any);

      if (result && result.id) {
        Alert.alert(
          "Order Placed Successfully!",
          `Order #${result.id} created\nTotal: ${formatCurrency(result.total)}`,
          [
            {
              text: "View Order",
              onPress: () => {
                clearCart();
                navigation.replace("Orders");
              },
            },
          ]
        );
      } else {
        Alert.alert("Success", "Order placed successfully");
        clearCart();
        navigation.replace("Orders");
      }
    } catch (error: any) {
      console.error("Order creation error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to place order";
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color={COLORS.LIGHT_GRAY} style={{marginBottom: 20}} />
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <Button
            title="Continue Shopping"
            onPress={() => navigation.navigate("Search")}
            containerStyle={{marginTop: 20}}
          />
        </View>
      </SafeAreaView>
    );
  }

  const subtotal = totalPrice;
  const finalTotal = subtotal + deliveryFee - discount;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Order Items Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.product?.name}</Text>
                <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>{formatCurrency((item.product?.price || 0) * item.quantity)}</Text>
            </View>
          ))}
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <Input
            label="Address"
            placeholder="Enter street address"
            value={deliveryAddress}
            onChangeText={setDeliveryAddress}
            multiline
            numberOfLines={3}
            containerStyle={styles.input}
          />
          <Input
            label="Recipient Name"
            placeholder="Your name"
            value={recipientName}
            onChangeText={setRecipientName}
            containerStyle={styles.input}
          />
          <Input
            label="Phone Number"
            placeholder="0912345678"
            value={recipientPhone}
            onChangeText={setRecipientPhone}
            keyboardType="phone-pad"
            containerStyle={styles.input}
          />
        </View>

        {/* Delivery Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Notes (Optional)</Text>
          <Input
            placeholder="e.g., No onions, extra sauce..."
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={2}
            containerStyle={styles.input}
          />
        </View>

        {/* Promotion Code */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Promotion Code</Text>
          {discount > 0 ? (
            <View style={styles.promoApplied}>
              <Ionicons name="checkmark-circle" size={24} color={COLORS.SUCCESS} />
              <View style={styles.promoInfo}>
                <Text style={styles.promoCode}>{promoCode}</Text>
                <Text style={styles.promoDiscount}>Discount: {formatCurrency(discount)}</Text>
              </View>
              <TouchableOpacity onPress={handleRemovePromo}>
                <Ionicons name="close" size={24} color={COLORS.ERROR} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.promoInputContainer}>
              <Input
                placeholder="Enter promotion code"
                value={promoCode}
                onChangeText={setPromoCode}
                containerStyle={{flex: 1, marginVertical: 0}}
              />
              <Button
                title="Apply"
                onPress={handleValidatePromo}
                loading={validatingPromo}
                size="small"
                containerStyle={styles.applyButton}
              />
            </View>
          )}
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <TouchableOpacity style={styles.paymentDisplay} onPress={() => setShowPaymentModal(true)}>
            <View style={styles.paymentDisplayContent}>
              <Ionicons
                name={PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.icon || ("cash-outline" as any)}
                size={24}
                color={COLORS.PRIMARY}
              />
              <Text style={styles.paymentDisplayText}>
                {PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.GRAY} />
          </TouchableOpacity>
        </View>

        {/* Price Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(deliveryFee)}</Text>
          </View>
          {discount > 0 && (
            <View style={[styles.summaryRow, styles.discountRow]}>
              <Text style={[styles.summaryLabel, styles.discountLabel]}>Discount:</Text>
              <Text style={[styles.summaryValue, styles.discountValue]}>-{formatCurrency(discount)}</Text>
            </View>
          )}
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>{formatCurrency(finalTotal)}</Text>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.footer}>
        <Button
          title={`Place Order - ${formatCurrency(finalTotal)}`}
          onPress={handlePlaceOrder}
          loading={loading}
          containerStyle={styles.placeButton}
        />
      </View>

      {/* Payment Method Modal */}
      <Modal
        visible={showPaymentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Payment Method</Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.DARK} />
              </TouchableOpacity>
            </View>

            {PAYMENT_METHODS.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[styles.paymentOption, paymentMethod === method.id && styles.paymentOptionSelected]}
                onPress={() => {
                  setPaymentMethod(method.id);
                  setShowPaymentModal(false);
                }}
              >
                <Ionicons name={method.icon as any} size={28} color={COLORS.PRIMARY} />
                <Text style={styles.paymentOptionLabel}>{method.label}</Text>
                {paymentMethod === method.id && <Ionicons name="checkmark-circle" size={24} color={COLORS.PRIMARY} />}
              </TouchableOpacity>
            ))}
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.GRAY,
    marginBottom: 20,
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
    alignItems: "center",
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.DARK,
    marginBottom: 4,
  },
  itemQty: {
    fontSize: 12,
    color: COLORS.GRAY,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.PRIMARY,
  },
  input: {
    marginVertical: 8,
  },
  promoInputContainer: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-end",
  },
  applyButton: {
    marginBottom: 8,
  },
  promoApplied: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F8F5",
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  promoInfo: {
    flex: 1,
  },
  promoCode: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.DARK,
  },
  promoDiscount: {
    fontSize: 12,
    color: COLORS.SUCCESS,
    marginTop: 4,
  },
  paymentDisplay: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 8,
  },
  paymentDisplayContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  paymentDisplayText: {
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
    fontSize: 14,
    color: COLORS.GRAY,
  },
  summaryValue: {
    fontSize: 14,
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
  placeButton: {
    width: "100%",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.WHITE,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 16,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.DARK,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
    gap: 12,
  },
  paymentOptionSelected: {
    backgroundColor: "#F0F8FF",
  },
  paymentOptionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.DARK,
    flex: 1,
  },
});

export default CheckoutScreen;
