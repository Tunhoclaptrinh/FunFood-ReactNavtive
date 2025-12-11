import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";

const FaqCancelOrderScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Làm thế nào để hủy đơn hàng?</Text>

      <Text style={styles.text}>
        Bạn có thể hủy đơn khi đơn hàng chưa được nhà hàng xác nhận.
      </Text>

      <Text style={styles.step}>1. Mở ứng dụng FunFood.</Text>
      <Text style={styles.step}>2. Vào mục Đơn hàng của tôi.</Text>
      <Text style={styles.step}>3. Chọn đơn muốn hủy.</Text>
      <Text style={styles.step}>4. Nhấn “Hủy đơn hàng”.</Text>

      <Text style={styles.note}>
        Lưu ý: Nếu nhà hàng đã bắt đầu chế biến, đơn sẽ không thể hủy.
      </Text>
    </ScrollView>
  );
};

export default FaqCancelOrderScreen;

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 12 },
  text: { fontSize: 16, marginBottom: 16, color: "#333" },
  step: { fontSize: 15, marginBottom: 10 },
  note: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#FFF5E5",
    borderRadius: 8,
    color: "#B86E00",
  },
});
