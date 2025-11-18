import React from "react";
import {View, Text, StyleSheet} from "react-native";

const OrdersScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Orders</Text>
      <Text style={styles.subtitle}>Coming soon...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: "#fff", justifyContent: "center", alignItems: "center"},
  title: {fontSize: 24, fontWeight: "bold"},
  subtitle: {fontSize: 16, color: "#999", marginTop: 8},
});

export default OrdersScreen;
