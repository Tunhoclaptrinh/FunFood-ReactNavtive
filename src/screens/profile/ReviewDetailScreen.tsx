import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { ROUTE_NAMES } from "@/src/navigation/types";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/styles/colors";

export default function ReviewDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { review } = route.params;

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>
        {review.type === "product" ? review.productName : review.restaurantName}
      </Text>

      {/* Rating */}
      <View style={styles.ratingRow}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Ionicons
            key={i}
            name={i < review.rating ? "star" : "star-outline"}
            size={22}
            color="#FFB800"
          />
        ))}
      </View>

      {/* Comment */}
      <Text style={styles.comment}>{review.comment}</Text>

      {/* Buttons */}
      {review.productId && (
        <TouchableOpacity
          style={styles.btn}
          onPress={() =>
            navigation.navigate(ROUTE_NAMES.HOME.PRODUCT_DETAIL, {
              id: review.productId,
            })
          }
        >
          <Text style={styles.btnText}>Xem sản phẩm</Text>
        </TouchableOpacity>
      )}

      {review.restaurantId && (
        <TouchableOpacity
          style={styles.btn}
          onPress={() =>
            navigation.navigate(ROUTE_NAMES.HOME.RESTAURANT_DETAIL, {
              id: review.restaurantId,
            })
          }
        >
          <Text style={styles.btnText}>Xem nhà hàng</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 10 },
  ratingRow: { flexDirection: "row", marginBottom: 15 },
  comment: { fontSize: 16, color: COLORS.DARK, marginVertical: 20 },
  btn: {
    backgroundColor: COLORS.PRIMARY,
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  btnText: { color: "#fff", fontWeight: "600", textAlign: "center" },
});