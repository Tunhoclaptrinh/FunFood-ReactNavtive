import React from "react";
import {View, StyleSheet, Text} from "react-native";
import EmptyState from "@components/common/EmptyState";
import {COLORS} from "@/src/config/constants";

const OrdersScreen = () => {
  return (
    <View style={styles.container}>
      <EmptyState icon="list-outline" title="No Orders Yet" subtitle="Start ordering your favorite food!" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.WHITE},
});

export default OrdersScreen;
