import React from "react";
import {View, Text, Image, TouchableOpacity, StyleSheet} from "react-native";
import {useNavigation} from "@react-navigation/native";
import {MaterialCommunityIcons as Icon} from "@expo/vector-icons";
import {colors} from "@constants/colors";
import {Restaurant} from "@types/models.types";

interface RestaurantCardProps {
  restaurant: Restaurant;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({restaurant}) => {
  const navigation = useNavigation<any>();

  return (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("RestaurantDetail", {id: restaurant.id})}>
      <Image source={{uri: restaurant.image}} style={styles.image} />

      <View style={styles.content}>
        <Text style={styles.name}>{restaurant.name}</Text>

        <View style={styles.info}>
          <View style={styles.ratingContainer}>
            <Icon name="star" size={16} color="#ffc107" />
            <Text style={styles.rating}>{restaurant.rating}</Text>
          </View>

          <Text style={styles.deliveryTime}>{restaurant.deliveryTime}</Text>
        </View>

        <Text style={styles.address} numberOfLines={1}>
          {restaurant.address}
        </Text>
      </View>

      {!restaurant.isOpen && (
        <View style={styles.closedBadge}>
          <Text style={styles.closedText}>Closed</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 8,
    marginVertical: 8,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: "100%",
    height: 180,
  },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  info: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: "600",
  },
  deliveryTime: {
    fontSize: 12,
    color: "#666",
  },
  address: {
    fontSize: 12,
    color: "#999",
  },
  closedBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  closedText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});

export default RestaurantCard;
