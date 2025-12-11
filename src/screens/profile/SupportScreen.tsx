import { View, Text, TouchableOpacity, Linking, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function SupportScreen() {
  const navigation = useNavigation<any>();

  const openEmail = () => Linking.openURL("mailto:abcxyz@gmail.com");
  const openPhone = () => Linking.openURL("tel:0123456789");

  const faqItems = [
    {
      icon: "❓",
      title: "Làm thế nào khi đơn thiếu món",
      desc: "Hướng dẫn xử lý khi thiếu món trong đơn",
      nav: "FaqMissingFood",
    },
    {
      icon: "💳",
      title: "Sự cố thanh toán",
      desc: "Giải quyết các lỗi thanh toán – nạp tiền",
      nav: "FaqPaymentIssue",
    },
    {
      icon: "📦",
      title: "Làm thế nào để hủy đơn",
      desc: "Điều kiện và cách hủy đơn hàng",
      nav: "FaqCancelOrder",
    },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#fff" }}
      contentContainerStyle={{ padding: 20 }}
    >
      {/* HEADER */}
      <Text
        style={{
          fontSize: 26,
          fontWeight: "bold",
          color: "#FF7A00",
          marginBottom: 10,
        }}
      >
        Trung tâm trợ giúp
      </Text>

      <Text style={{ fontSize: 15, color: "#555", marginBottom: 25 }}>
        Nơi bạn có thể xem hướng dẫn và tìm câu trả lời cho các vấn đề thường gặp khi sử dụng FunFood.
      </Text>

      {/* SECTION 1 — CONTACT */}
      <Text
        style={{
          fontSize: 18,
          fontWeight: "bold",
          marginBottom: 12,
          color: "#333",
        }}
      >
        Kênh liên hệ hỗ trợ
      </Text>

      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 12,
          padding: 18,
          marginBottom: 22,
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 5,
          shadowOffset: { width: 0, height: 3 },
          elevation: 3,
        }}
      >
        {/* EMAIL */}
        <TouchableOpacity
          onPress={openEmail}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          <Text style={{ fontSize: 28, marginRight: 12 }}>📧</Text>
          <View>
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#FF7A00" }}>
              Email
            </Text>
            <Text style={{ fontSize: 14, color: "#555" }}>
              abcxyz@gmail.com
            </Text>
          </View>
        </TouchableOpacity>

        {/* PHONE */}
        <TouchableOpacity
          onPress={openPhone}
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 28, marginRight: 12 }}>📞</Text>
          <View>
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#FF7A00" }}>
              Hotline
            </Text>
            <Text style={{ fontSize: 14, color: "#555" }}>0123 456 789</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* SECTION 2 — FAQ */}
      <Text
        style={{
          fontSize: 18,
          fontWeight: "bold",
          marginBottom: 12,
          color: "#333",
        }}
      >
        Câu hỏi thường gặp
      </Text>

      {faqItems.map((item, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => navigation.navigate(item.nav)}
          style={{
            backgroundColor: "#fff",
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            shadowColor: "#000",
            shadowOpacity: 0.06,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
            elevation: 2,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 28, marginRight: 15 }}>{item.icon}</Text>
          <View>
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#333" }}>
              {item.title}
            </Text>
            <Text style={{ fontSize: 13, color: "#666" }}>{item.desc}</Text>
          </View>
        </TouchableOpacity>
      ))}

      {/* FOOTER */}
      <Text
        style={{
          textAlign: "center",
          marginTop: 25,
          fontSize: 14,
          color: "#777",
          marginBottom: 40,
        }}
      >
        FunFood luôn sẵn sàng hỗ trợ bạn 24/7.
      </Text>
    </ScrollView>
  );
}