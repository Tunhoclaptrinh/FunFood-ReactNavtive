import React from "react";
import {View, Text, FlatList, StyleSheet, TouchableOpacity, Alert} from "react-native";
import {useCartStore} from "@store/cartStore";
import {Button} from "@components/base/Button";
import {colors} from "@constants/colors";
import {MaterialCommunityIcons as Icon} from "@expo/vector-icons";

const CartScreen: React.FC = () => {
  const {items, removeItem, updateQuantity, clearCart, getCartTotal, getItemCount} = useCartStore();

  const handleCheckout = () => {
    if (items.length === 0) {
      Alert.alert("Cart Empty", "Please add items to cart");
      return;
    }
    Alert.alert("Success", "Checkout feature coming soon!");
  };

  const handleRemove = (itemId: number) => {
    Alert.alert("Remove Item", "Are you sure?", [
      {text: "Cancel", style: "cancel"},
      {text: "Remove", onPress: () => removeItem(itemId), style: "destructive"},
    ]);
  };

  return (
    <View style={styles.container}>
      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="cart-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>Your cart is empty</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({item}) => (
              <View style={styles.cartItem}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.product?.name || "Product"}</Text>
                  <Text style={styles.itemPrice}>₫{item.product?.price.toLocaleString() || "0"}</Text>
                </View>

                <View style={styles.quantityContainer}>
                  <TouchableOpacity onPress={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}>
                    <Icon name="minus-circle" size={28} color={colors.primary} />
                  </TouchableOpacity>
                  <Text style={styles.quantity}>{item.quantity}</Text>
                  <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity + 1)}>
                    <Icon name="plus-circle" size={28} color={colors.primary} />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => handleRemove(item.id)}>
                  <Icon name="delete" size={24} color={colors.danger} />
                </TouchableOpacity>
              </View>
            )}
          />

          <View style={styles.footer}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalAmount}>₫{getCartTotal().toLocaleString()}</Text>
            </View>
            <Button title="Checkout" onPress={handleCheckout} />
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: "#fff"},
  emptyContainer: {flex: 1, justifyContent: "center", alignItems: "center"},
  emptyText: {fontSize: 16, color: "#999", marginTop: 16},
  cartItem: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
  },
  itemInfo: {flex: 1},
  itemName: {fontSize: 16, fontWeight: "600"},
  itemPrice: {fontSize: 14, color: "#666", marginTop: 4},
  quantityContainer: {flexDirection: "row", alignItems: "center", gap: 12, marginHorizontal: 16},
  quantity: {fontSize: 16, fontWeight: "bold", minWidth: 30, textAlign: "center"},
  footer: {padding: 16, borderTopWidth: 1, borderTopColor: "#eee"},
  totalContainer: {flexDirection: "row", justifyContent: "space-between", marginBottom: 16},
  totalLabel: {fontSize: 18, fontWeight: "bold"},
  totalAmount: {fontSize: 18, fontWeight: "bold", color: colors.primary},
});

export default CartScreen;
