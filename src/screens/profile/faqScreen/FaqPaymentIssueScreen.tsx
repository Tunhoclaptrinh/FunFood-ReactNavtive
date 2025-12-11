import React from "react";
import { Text, ScrollView, StyleSheet } from "react-native";

const FaqPaymentIssueScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Sự cố khi thanh toán?</Text>

      <Text style={styles.text}>
        Nếu bạn gặp lỗi thanh toán trên FunFood, hãy thử các bước sau:
      </Text>

      <Text style={styles.step}>
        1. Kiểm tra số dư ví hoặc tài khoản ngân hàng.
      </Text>
      <Text style={styles.step}>
        2. Kiểm tra lại kết nối Internet hoặc đổi mạng khác.
      </Text>
      <Text style={styles.step}>
        3. Nếu dùng thẻ ngân hàng, hãy đảm bảo thẻ còn hiệu lực.
      </Text>

      <Text style={styles.note}>
        Nếu lỗi vẫn tiếp diễn, vui lòng liên hệ FunFood Support và liên hệ "Kênh liên hệ hỗ trợ" để được hỗ trợ
        nhanh hơn và trực tiếp với nhà hàng.
      </Text>
    </ScrollView>
  );
};

export default FaqPaymentIssueScreen;

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 12 },
  text: { fontSize: 16, marginBottom: 16, color: "#333" },
  step: { fontSize: 15, marginBottom: 10 },
  note: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#E8F4FF",
    borderRadius: 8,
    color: "#1A73E8",
  },
});
