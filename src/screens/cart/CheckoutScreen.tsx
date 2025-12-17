import React, {useEffect, useState} from "react";
import {View, ScrollView, StyleSheet, Text, TouchableOpacity, Alert, Modal, FlatList} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {useCart} from "@hooks/useCart";
import {OrderService} from "@services/order.service";
import {AddressService} from "@services/address.service"; // Import mới
import {PromotionService} from "@services/promotion.service";
import {useGeolocation} from "@hooks/useGeolocation";
import Input from "@/src/components/common/Input/Input";
import Button from "@/src/components/common/Button";
import {formatCurrency} from "@utils/formatters";
import {COLORS} from "@/src/styles/colors";
import SafeAreaView from "@/src/components/common/SafeAreaView";
import {Address} from "@/src/types/address"; // Import Type
import {calculateDeliveryFee, calculateDistance} from "@/src/utils/helpers";

const PAYMENT_METHODS = [
  {id: "cash", label: "Tiền mặt (COD)", icon: "cash-outline"},
  {id: "card", label: "Thẻ ngân hàng", icon: "card-outline"},
  {id: "momo", label: "Ví MoMo", icon: "wallet-outline"},
  {id: "zalopay", label: "ZaloPay", icon: "wallet-outline"},
];

const CheckoutScreen = ({navigation}: any) => {
  const {items, totalPrice, clearCart} = useCart();
  const {location} = useGeolocation();

  // --- State cho Address ---
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [addressList, setAddressList] = useState<Address[]>([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(false);

  // --- Các State khác ---
  const [note, setNote] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(15000);
  const [loading, setLoading] = useState(false);
  const [validatingPromo, setValidatingPromo] = useState(false);

  const restaurantId = items[0]?.restaurant?.id;

  console.log("ai đây ?", items);

  // --- Load dữ liệu ---
  useEffect(() => {
    fetchDefaultAddress();
    fetchAddressList();
  }, []);

  useEffect(() => {
    const calculateShipping = async () => {
      if (!selectedAddress || !items[0]?.restaurant) return;

      const restaurant = items[0].restaurant;
      // Đảm bảo convert sang Number nếu dữ liệu là string
      const resLat = Number(restaurant.latitude);
      const resLng = Number(restaurant.longitude);
      const userLat = Number(selectedAddress.latitude);
      const userLng = Number(selectedAddress.longitude);

      if (resLat && resLng && userLat && userLng) {
        const dist = calculateDistance(userLat, userLng, resLat, resLng);

        if (dist > 50) {
          Alert.alert("Cảnh báo", `Khoảng cách quá xa (${dist.toFixed(1)}km). Vui lòng chọn nhà hàng gần hơn.`);
        }

        const fee = calculateDeliveryFee(dist);
        setDeliveryFee(fee);
      }
    };
    calculateShipping();
  }, [selectedAddress, items]);

  const fetchDefaultAddress = async () => {
    const defaultAddr = await AddressService.getDefaultAddress();
    if (defaultAddr) setSelectedAddress(defaultAddr);
  };

  const fetchAddressList = async () => {
    try {
      setLoadingAddress(true);
      const list = await AddressService.getMyAddresses();
      setAddressList(list.data);
    } catch (error) {
      console.log("Error fetching addresses", error);
    } finally {
      setLoadingAddress(false);
    }
  };

  // --- Logic Xử lý ---
  const handleValidatePromo = async () => {
    if (!promoCode.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập mã khuyến mãi");
      return;
    }
    setValidatingPromo(true);
    try {
      // Validate mã giảm giá với các thông số hiện tại
      const result = await PromotionService.validatePromotion(promoCode, totalPrice, deliveryFee);
      if (result.success || result.data) {
        const discountAmount = result.data?.discount || result.calculation?.discount || 0;
        setDiscount(discountAmount);
        Alert.alert("Thành công", `Đã áp dụng giảm giá: ${formatCurrency(discountAmount)}`);
      }
    } catch (error) {
      Alert.alert("Lỗi", "Mã khuyến mãi không hợp lệ hoặc đã hết hạn");
      setDiscount(0);
      setPromoCode("");
    } finally {
      setValidatingPromo(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) return Alert.alert("Lỗi", "Giỏ hàng trống");
    if (!selectedAddress) return Alert.alert("Lỗi", "Vui lòng chọn địa chỉ giao hàng");
    if (!restaurantId) return Alert.alert("Lỗi", "Thông tin nhà hàng không hợp lệ");

    setLoading(true);
    try {
      const orderData = {
        restaurantId,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        // Sử dụng thông tin từ địa chỉ đã chọn
        deliveryAddress: selectedAddress.address,
        deliveryLatitude: selectedAddress.latitude || location?.latitude,
        deliveryLongitude: selectedAddress.longitude || location?.longitude,
        paymentMethod,
        note,
        promotionCode: promoCode || undefined,
      };

      const result = await OrderService.createOrder(orderData as any);

      if (result && result.id) {
        Alert.alert("Thành công", `Đơn hàng #${result.id} đã được tạo!`, [
          {
            text: "OK",
            onPress: () => {
              clearCart();
              navigation.navigate("Orders");
            },
          },
        ]);
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || "Không thể tạo đơn hàng";
      Alert.alert("Lỗi", msg);
    } finally {
      setLoading(false);
    }
  };

  // Component hiển thị Item trong Modal chọn địa chỉ
  const renderAddressItem = ({item}: {item: Address}) => (
    <TouchableOpacity
      style={[styles.addressItem, selectedAddress?.id === item.id && styles.addressItemSelected]}
      onPress={() => {
        setSelectedAddress(item);
        setShowAddressModal(false);
      }}
    >
      <View style={{flex: 1}}>
        <View style={{flexDirection: "row", alignItems: "center", marginBottom: 4}}>
          <Text style={styles.addressLabel}>{item.label}</Text>
          {item.isDefault && <Text style={styles.defaultBadge}>Mặc định</Text>}
        </View>
        <Text style={styles.addressText} numberOfLines={2}>
          {item.address}
        </Text>
        <Text style={styles.recipientText}>
          {item.recipientName} • {item.recipientPhone}
        </Text>
      </View>
      {selectedAddress?.id === item.id && <Ionicons name="checkmark-circle" size={24} color={COLORS.PRIMARY} />}
    </TouchableOpacity>
  );

  const subtotal = totalPrice;
  const finalTotal = subtotal + deliveryFee - discount;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* --- Phần Địa chỉ Giao hàng (MỚI) --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text>

          {selectedAddress ? (
            <TouchableOpacity style={styles.selectedAddressCard} onPress={() => setShowAddressModal(true)}>
              <View style={styles.addressIcon}>
                <Ionicons name="location" size={24} color={COLORS.PRIMARY} />
              </View>
              <View style={{flex: 1}}>
                <View style={{flexDirection: "row", justifyContent: "space-between"}}>
                  <Text style={styles.saLabel}>{selectedAddress.label}</Text>
                  <Text style={styles.saChange}>Thay đổi</Text>
                </View>
                <Text style={styles.saAddress} numberOfLines={2}>
                  {selectedAddress.address}
                </Text>
                <Text style={styles.saRecipient}>
                  {selectedAddress.recipientName} | {selectedAddress.recipientPhone}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.addAddressButton} onPress={() => setShowAddressModal(true)}>
              <Ionicons name="add-circle-outline" size={24} color={COLORS.PRIMARY} />
              <Text style={styles.addAddressText}>Chọn địa chỉ giao hàng</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* --- Danh sách món ăn --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tóm tắt đơn hàng</Text>
          {items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.product?.name}</Text>
                <Text style={styles.itemQty}>x{item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>{formatCurrency((item.product?.price || 0) * item.quantity)}</Text>
            </View>
          ))}
        </View>

        {/* --- Ghi chú --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ghi chú cho tài xế</Text>
          <Input
            placeholder="Ví dụ: Không hành, nhiều ớt..."
            value={note}
            onChangeText={setNote}
            containerStyle={{marginVertical: 0}}
          />
        </View>

        {/* --- Khuyến mãi --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Khuyến mãi</Text>
          <View style={styles.promoContainer}>
            <Input
              placeholder="Nhập mã giảm giá"
              value={promoCode}
              onChangeText={setPromoCode}
              containerStyle={{flex: 1, marginVertical: 0}}
            />
            <Button
              title="Áp dụng"
              onPress={handleValidatePromo}
              loading={validatingPromo}
              size="small"
              containerStyle={{marginLeft: 4, width: 90}}
            />
          </View>
        </View>

        {/* --- Phương thức thanh toán --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thanh toán</Text>
          <TouchableOpacity style={styles.paymentSelector} onPress={() => setShowPaymentModal(true)}>
            <View style={{flexDirection: "row", alignItems: "center", gap: 10}}>
              <Ionicons
                name={PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.icon as any}
                size={24}
                color={COLORS.PRIMARY}
              />
              <Text style={styles.paymentText}>{PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.GRAY} />
          </TouchableOpacity>
        </View>

        {/* --- Tổng cộng --- */}
        <View style={styles.section}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tạm tính</Text>
            <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phí giao hàng</Text>
            <Text style={styles.summaryValue}>{formatCurrency(deliveryFee)}</Text>
          </View>
          {discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, {color: COLORS.SUCCESS}]}>Giảm giá</Text>
              <Text style={[styles.summaryValue, {color: COLORS.SUCCESS}]}>-{formatCurrency(discount)}</Text>
            </View>
          )}
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Tổng thanh toán</Text>
            <Text style={styles.totalValue}>{formatCurrency(finalTotal)}</Text>
          </View>
        </View>

        <View style={{height: 100}} />
      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <Button
          title={`Đặt hàng • ${formatCurrency(finalTotal)}`}
          onPress={handlePlaceOrder}
          loading={loading}
          containerStyle={{width: "100%"}}
        />
      </View>

      {/* --- Modal Chọn Địa Chỉ --- */}
      <Modal visible={showAddressModal} animationType="slide">
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowAddressModal(false)}>
            <Ionicons name="close" size={24} color={COLORS.DARK} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Chọn địa chỉ</Text>
          <TouchableOpacity
            onPress={() => {
              setShowAddressModal(false);
              navigation.navigate("AddressList"); // Điều hướng sang trang quản lý địa chỉ
            }}
          >
            <Text style={{color: COLORS.PRIMARY, fontWeight: "600"}}>Quản lý</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={addressList}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderAddressItem}
          contentContainerStyle={{padding: 16}}
          ListEmptyComponent={
            <View style={{alignItems: "center", marginTop: 50}}>
              <Text style={{color: COLORS.GRAY}}>Bạn chưa lưu địa chỉ nào</Text>
              <Button
                title="Thêm địa chỉ mới"
                onPress={() => {
                  setShowAddressModal(false);
                  navigation.navigate("AddAddress");
                }}
                containerStyle={{marginTop: 16}}
              />
            </View>
          }
        />
      </Modal>

      {/* --- Modal Chọn Thanh Toán --- */}
      <Modal visible={showPaymentModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Phương thức thanh toán</Text>
            {PAYMENT_METHODS.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[styles.paymentOption, paymentMethod === method.id && styles.paymentOptionSelected]}
                onPress={() => {
                  setPaymentMethod(method.id);
                  setShowPaymentModal(false);
                }}
              >
                <Ionicons
                  name={method.icon as any}
                  size={24}
                  color={paymentMethod === method.id ? COLORS.PRIMARY : COLORS.GRAY}
                />
                <Text
                  style={[
                    styles.paymentOptionText,
                    paymentMethod === method.id && {color: COLORS.PRIMARY, fontWeight: "bold"},
                  ]}
                >
                  {method.label}
                </Text>
                {paymentMethod === method.id && <Ionicons name="checkmark" size={20} color={COLORS.PRIMARY} />}
              </TouchableOpacity>
            ))}
            <Button title="Đóng" onPress={() => setShowPaymentModal(false)} containerStyle={{marginTop: 10}} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: "#F9FAFB"},
  section: {
    backgroundColor: COLORS.WHITE,
    padding: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.DARK,
    marginBottom: 12,
  },
  // Style cho Address Card
  selectedAddressCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F0F9FF",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  addressIcon: {marginRight: 12, marginTop: 2},
  saLabel: {fontWeight: "bold", fontSize: 14, color: COLORS.DARK, marginBottom: 2},
  saChange: {fontSize: 12, color: COLORS.PRIMARY, fontWeight: "600"},
  saAddress: {fontSize: 13, color: COLORS.DARK_GRAY, marginBottom: 4},
  saRecipient: {fontSize: 12, color: COLORS.GRAY},
  addAddressButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
    borderStyle: "dashed",
    borderRadius: 8,
    gap: 8,
  },
  addAddressText: {color: COLORS.PRIMARY, fontWeight: "600"},

  // List Items
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  itemInfo: {flex: 1},
  itemName: {fontSize: 14, color: COLORS.DARK},
  itemQty: {fontSize: 12, color: COLORS.GRAY},
  itemPrice: {fontSize: 14, fontWeight: "600"},

  // Promo
  promoContainer: {flexDirection: "row", alignItems: "center"},

  // Payment
  paymentSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 8,
  },
  paymentText: {fontSize: 14, fontWeight: "500", color: COLORS.DARK},

  // Summary
  summaryRow: {flexDirection: "row", justifyContent: "space-between", marginBottom: 8},
  summaryLabel: {fontSize: 14, color: COLORS.GRAY},
  summaryValue: {fontSize: 14, fontWeight: "600", color: COLORS.DARK},
  divider: {height: 1, backgroundColor: COLORS.BORDER, marginVertical: 12},
  totalLabel: {fontSize: 16, fontWeight: "bold"},
  totalValue: {fontSize: 18, fontWeight: "bold", color: COLORS.PRIMARY},

  footer: {
    padding: 16,
    backgroundColor: COLORS.WHITE,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },

  // Modal Address
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  modalTitle: {fontSize: 18, fontWeight: "bold"},
  addressItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
    backgroundColor: COLORS.WHITE,
  },
  addressItemSelected: {backgroundColor: "#F0F9FF"},
  addressLabel: {fontWeight: "bold", fontSize: 14, marginRight: 8},
  defaultBadge: {
    fontSize: 10,
    color: COLORS.PRIMARY,
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  addressText: {fontSize: 13, color: COLORS.DARK_GRAY, marginTop: 2},
  recipientText: {fontSize: 12, color: COLORS.GRAY, marginTop: 4},

  // Modal Payment Overlay
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 20,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
    gap: 12,
  },
  paymentOptionSelected: {backgroundColor: "#F5F5F5"},
  paymentOptionText: {fontSize: 14, color: COLORS.DARK, flex: 1},
});

export default CheckoutScreen;
