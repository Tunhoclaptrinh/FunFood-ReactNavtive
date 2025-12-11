import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";

const FaqMissingFoodScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Làm thế nào khi đơn thiếu món?</Text>
      <Text style={styles.text}>
        Nếu đơn hàng của bạn bị thiếu món, hãy thực hiện các bước sau:
      </Text>

      <Text style={styles.step}>1. Chụp ảnh bill và món đã nhận.</Text>
      <Text style={styles.step}>
        2. Kiểm tra lại thông tin đơn hàng trong ứng dụng.
      </Text>
      <Text style={styles.step}>
        3. Liên hệ FunFood qua mục "Kênh liên hệ hỗ trợ" để được xử lý trực tiếp và nhanh chóng.
      </Text>

      <Text style={styles.note}>
        Lưu ý: Vui lòng giữ lại toàn bộ món ăn đã nhận và hóa đơn để hỗ trợ kiểm tra.
      </Text>
    </ScrollView>
  );
};

export default FaqMissingFoodScreen;

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