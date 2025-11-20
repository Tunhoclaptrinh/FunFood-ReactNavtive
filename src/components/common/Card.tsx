import React from "react";
import {View, TouchableOpacity, Image, Text, StyleSheet, ViewStyle} from "react-native";
import {Ionicons} from "@expo/vector-icons";

interface CardProps {
  image?: string;
  title: string;
  subtitle?: string;
  description?: string;
  rating?: number;
  badge?: string;
  onPress?: () => void;
  style?: ViewStyle;
}

const Card: React.FC<CardProps> = ({image, title, subtitle, description, rating, badge, onPress, style}) => {
  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component style={[styles.card, style]} onPress={onPress} activeOpacity={0.7}>
      {image && (
        <View style={styles.imageContainer}>
          <Image source={{uri: image}} style={styles.image} />
          {badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        {description && (
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
        )}

        {rating !== undefined && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFB800" />
            <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
          </View>
        )}
      </View>
    </Component>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 150,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  badge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#FF6B6B",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1F2937",
  },
});

export default Card;
