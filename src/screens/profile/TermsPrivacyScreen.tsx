import { View, Text, ScrollView } from "react-native";

export default function TermsPrivacyScreen() {
  return (
    <ScrollView style={{ flex: 1, padding: 20, backgroundColor: "#fff" }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 15 }}>
        Về chúng tôi: nhóm 4 người là Công, Tuấn, Long, Quân.
      </Text>

      <Text style={{ fontSize: 16, marginBottom: 20, lineHeight: 24 }}>
        Ứng dụng được phát triển với mục tiêu mang đến trải nghiệm đặt món và
        đánh giá nhà hàng nhanh chóng, trực quan và tiện lợi cho người dùng.
      </Text>

      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}>
        Điều khoản & Chính sách
      </Text>

      <Text style={{ fontSize: 15, lineHeight: 22, marginBottom: 15 }}>
        • Chúng tôi cam kết bảo mật thông tin người dùng.{"\n"}
        • Dữ liệu của bạn chỉ được sử dụng cho mục đích vận hành ứng dụng.{"\n"}
        • Khi sử dụng ứng dụng, bạn đồng ý với các điều khoản này.{"\n"}
      </Text>

      <Text style={{ fontSize: 14, color: "#666", marginTop: 20 }}>
        Phiên bản 1.0.0
      </Text>
    </ScrollView>
  );
}