import React from "react";
import {View, StyleSheet, Text, ScrollView} from "react-native";
import {useCart} from "@hooks/useCart";
import EmptyState from "@components/common/EmptyState";
import Button from "@components/common/Button";
import {formatCurrency} from "@utils/formatters";
import {COLORS} from "@/src/config/constants";

const CartScreen = () => {
  const {items, totalPrice, clearCart} = useCart();

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState icon="cart-outline" title="Your cart is empty" subtitle="Add some delicious food!" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {items.map((item) => (
          <View key={item.id} style={styles.item}>
            <Text style={styles.itemName}>{item.product?.name}</Text>
            <Text style={styles.itemPrice}>{formatCurrency(item.product?.price || 0)}</Text>
            <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalPrice}>{formatCurrency(totalPrice)}</Text>
        </View>
        <Button title="Checkout" onPress={() => {}} style={styles.button} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.WHITE},
  content: {flex: 1, padding: 16},
  item: {backgroundColor: COLORS.LIGHT_GRAY, padding: 12, borderRadius: 8, marginBottom: 12},
  itemName: {fontSize: 16, fontWeight: "600", color: COLORS.DARK},
  itemPrice: {fontSize: 14, color: COLORS.PRIMARY, marginTop: 4},
  itemQty: {fontSize: 12, color: COLORS.GRAY, marginTop: 4},
  footer: {padding: 16, borderTopWidth: 1, borderTopColor: COLORS.LIGHT_GRAY},
  totalRow: {flexDirection: "row", justifyContent: "space-between", marginBottom: 12},
  totalLabel: {fontSize: 16, fontWeight: "600", color: COLORS.DARK},
  totalPrice: {fontSize: 16, fontWeight: "bold", color: COLORS.PRIMARY},
  button: {width: "100%"},
});

export default CartScreen;
