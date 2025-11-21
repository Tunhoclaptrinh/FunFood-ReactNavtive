import React from "react";
import {View, StyleSheet, Text, ScrollView, TouchableOpacity, FlatList, Alert} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {useCart} from "@hooks/useCart";
import EmptyState from "@components/common/EmptyState";
import Button from "@components/common/Button";
import {formatCurrency} from "@utils/formatters";
import {COLORS} from "@/src/config/constants";

const CartScreen = ({navigation}: any) => {
  const {items, removeItem, updateQuantity, totalPrice} = useCart();

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="cart-outline"
          title="Your cart is empty"
          subtitle="Add some delicious food!"
          containerStyle={styles.emptyState}
        />
        <View style={styles.emptyFooter}>
          <Button title="Start Shopping" onPress={() => navigation.navigate("Search")} style={styles.button} />
        </View>
      </View>
    );
  }

  const handleIncreaseQty = (itemId: number, currentQty: number) => {
    updateQuantity(itemId, Math.min(currentQty + 1, 20));
  };

  const handleDecreaseQty = (itemId: number, currentQty: number) => {
    if (currentQty > 1) {
      updateQuantity(itemId, currentQty - 1);
    }
  };

  const handleRemoveItem = (itemId: number, itemName: string) => {
    Alert.alert("Remove Item", `Remove ${itemName} from cart?`, [
      {text: "Cancel", style: "cancel"},
      {
        text: "Remove",
        onPress: () => removeItem(itemId),
        style: "destructive",
      },
    ]);
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      Alert.alert("Error", "Your cart is empty");
      return;
    }

    // Check if all items are from same restaurant
    const restaurantIds = new Set(items.map((item) => item.product?.restaurantId));

    if (restaurantIds.size > 1) {
      Alert.alert("Error", "All items must be from the same restaurant. Please remove items from other restaurants.");
      return;
    }

    navigation.navigate("Checkout");
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Shopping Cart</Text>

        <FlatList
          data={items}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({item}) => (
            <View style={styles.cartItem}>
              {/* Product Image */}
              {item.product?.image && (
                <View style={styles.imageContainer}>
                  <Ionicons name="image-outline" size={40} color={COLORS.LIGHT_GRAY} />
                </View>
              )}

              {/* Product Info */}
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.product?.name}</Text>
                <Text style={styles.itemPrice}>{formatCurrency(item.product?.price || 0)}</Text>

                {item.product?.discount ? <Text style={styles.discount}>{item.product.discount}% OFF</Text> : null}

                <Text style={styles.total}>Subtotal: {formatCurrency((item.product?.price || 0) * item.quantity)}</Text>
              </View>

              {/* Quantity Control */}
              <View style={styles.quantityControl}>
                <TouchableOpacity style={styles.qtyButton} onPress={() => handleDecreaseQty(item.id, item.quantity)}>
                  <Ionicons name="remove" size={18} color={COLORS.PRIMARY} />
                </TouchableOpacity>

                <Text style={styles.quantity}>{item.quantity}</Text>

                <TouchableOpacity style={styles.qtyButton} onPress={() => handleIncreaseQty(item.id, item.quantity)}>
                  <Ionicons name="add" size={18} color={COLORS.PRIMARY} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleRemoveItem(item.id, item.product?.name || "Item")}
                >
                  <Ionicons name="trash-outline" size={18} color={COLORS.ERROR} />
                </TouchableOpacity>
              </View>
            </View>
          )}
          scrollEnabled={false}
          contentContainerStyle={styles.listContent}
        />

        {/* Summary Section */}
        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Items ({items.length}):</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalPrice)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee:</Text>
            <Text style={styles.summaryValue}>Will be calculated</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Discount:</Text>
            <Text style={styles.summaryValue}>To be applied</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>{formatCurrency(totalPrice)}</Text>
          </View>

          <Text style={styles.note}>Delivery fee and discounts will be calculated at checkout</Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Checkout Footer */}
      <View style={styles.footer}>
        <Button
          title={`Checkout - ${formatCurrency(totalPrice)}`}
          onPress={handleCheckout}
          style={styles.checkoutButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: COLORS.DARK,
  },
  listContent: {
    marginBottom: 12,
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
    gap: 12,
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: COLORS.WHITE,
    justifyContent: "center",
    alignItems: "center",
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
  itemPrice: {
    fontSize: 13,
    color: COLORS.PRIMARY,
    fontWeight: "600",
    marginBottom: 4,
  },
  discount: {
    fontSize: 11,
    color: COLORS.SUCCESS,
    fontWeight: "600",
    marginBottom: 4,
  },
  total: {
    fontSize: 12,
    color: COLORS.GRAY,
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  qtyButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: COLORS.WHITE,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
  },
  quantity: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.DARK,
    minWidth: 24,
    textAlign: "center",
  },
  deleteButton: {
    paddingLeft: 8,
  },
  summarySection: {
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 13,
    color: COLORS.GRAY,
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: 13,
    color: COLORS.DARK,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.WHITE,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    color: COLORS.DARK,
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 16,
    color: COLORS.PRIMARY,
    fontWeight: "bold",
  },
  note: {
    fontSize: 11,
    color: COLORS.GRAY,
    fontStyle: "italic",
    marginTop: 12,
    textAlign: "center",
  },
  bottomPadding: {
    height: 20,
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
  checkoutButton: {
    width: "100%",
  },
  emptyState: {
    flex: 1,
  },
  emptyFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.LIGHT_GRAY,
  },
  button: {
    width: "100%",
  },
});

export default CartScreen;
