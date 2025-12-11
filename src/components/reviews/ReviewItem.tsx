import React from "react";
import {View, Text, StyleSheet, Image} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {COLORS} from "@/src/styles/colors";
import {Review} from "@/src/types";

interface Props {
  review: Review;
}

export const ReviewItem = ({review}: Props) => {
  // Mock tên user vì API review hiện tại có thể chưa trả về full user info
  // Trong thực tế bạn nên populate user từ backend
  const userName = "Người dùng ẩn danh";
  const date = new Date(review.createdAt).toLocaleDateString("vi-VN");

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={20} color={COLORS.GRAY} />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{userName}</Text>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons key={star} name={star <= review.rating ? "star" : "star-outline"} size={12} color="#FFB800" />
            ))}
            <Text style={styles.date}>{date}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.comment}>{review.comment}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    marginBottom: 8,
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EEEEEE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  info: {
    justifyContent: "center",
  },
  name: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.DARK,
    marginBottom: 2,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  date: {
    fontSize: 11,
    color: COLORS.GRAY,
    marginLeft: 8,
  },
  comment: {
    fontSize: 13,
    color: COLORS.DARK_GRAY,
    lineHeight: 18,
  },
});
