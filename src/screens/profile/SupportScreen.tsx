import { View, Text, Linking, TouchableOpacity } from "react-native";

export default function SupportScreen() {
  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: "#fff" }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 15 }}>
        Hỗ trợ khách hàng
      </Text>

      <Text style={{ fontSize: 16, marginBottom: 10 }}>
        Nếu bạn gặp khó khăn khi sử dụng ứng dụng, hãy liên hệ chúng tôi qua:
      </Text>

      <TouchableOpacity
        onPress={() => Linking.openURL("mailto:support@example.com")}
        style={{ marginVertical: 10 }}
      >
        <Text style={{ fontSize: 16, color: "blue" }}>
          📧 support@example.com
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => Linking.openURL("tel:0123456789")}
        style={{ marginVertical: 10 }}
      >
        <Text style={{ fontSize: 16, color: "blue" }}>
          📞 0123 456 789
        </Text>
      </TouchableOpacity>

      <Text style={{ marginTop: 20, fontSize: 14, color: "#555" }}>
        Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7.
      </Text>
    </View>
  );
}
