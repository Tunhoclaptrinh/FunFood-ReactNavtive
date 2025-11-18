import React from "react";
import {View, Text, StyleSheet, ScrollView, Image, FlatList, TouchableOpacity} from "react-native";
import {useRoute, useNavigation} from "@react-navigation/native";
import {useQuery} from "@tanstack/react-query";
import {restaurantApi} from "@api/restaurant.api";
import {Spin} from "@ant-design/react-native";
import {MaterialCommunityIcons as Icon} from "@expo/vector-icons";
import {colors} from "@constants/colors";
import {useCartStore} from "@store/cartStore";

const RestaurantDetailScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const {addItem} = useCartStore();
  const restaurantId = route.params?.id;

  const {data: restaurant, isLoading: restaurantLoading} = useQuery({
    queryKey: ["restaurant", restaurantId],
    queryFn: () => restaurantApi.getById(restaurantId),
  });

  const {data: menu, isLoading: menuLoading} = useQuery({
    queryKey: ["menu", restaurantId],
    queryFn: () => restaurantApi.getMenu(restaurantId),
  });

  if (restaurantLoading || menuLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Spin size="large" />
      </View>
    );
  }

  const restaurantData = restaurant?.data?.data;
  const products = menu?.data?.data?.data || [];

  const handleAddToCart = (product: any) => {
    addItem(product, 1);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Restaurant Header */}
      <Image source={{uri: restaurantData?.image || "https://via.placeholder.com/400"}} style={styles.headerImage} />

      <View style={styles.headerContent}>
        <Text style={styles.name}>{restaurantData?.name}</Text>

        <View style={styles.infoRow}>
          <View style={styles.ratingContainer}>
            <Icon name="star" size={20} color="#ffc107" />
            <Text style={styles.rating}>{restaurantData?.rating || "0"}</Text>
          </View>

          <Text style={styles.deliveryTime}>{restaurantData?.deliveryTime}</Text>

          <Text style={styles.deliveryFee}>₫{restaurantData?.deliveryFee?.toLocaleString() || "0"}</Text>
        </View>

        <Text style={styles.address}>{restaurantData?.address}</Text>
        <Text style={styles.description}>{restaurantData?.description}</Text>
      </View>

      {/* Menu */}
      <View style={styles.menuSection}>
        <Text style={styles.menuTitle}>Menu</Text>

        {products.length === 0 ? (
          <Text style={styles.emptyText}>No products available</Text>
        ) : (
          <FlatList
            data={products}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            renderItem={({item}) => (
              <View style={styles.productCard}>
                <Image source={{uri: item.image || "https://via.placeholder.com/100"}} style={styles.productImage} />

                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.productDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                  <Text style={styles.productPrice}>₫{item.price?.toLocaleString()}</Text>
                </View>

                <TouchableOpacity style={styles.addButton} onPress={() => handleAddToCart(item)}>
                  <Icon name="plus" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: "#fff"},
  loadingContainer: {flex: 1, justifyContent: "center", alignItems: "center"},
  headerImage: {width: "100%", height: 250},
  headerContent: {padding: 16},
  name: {fontSize: 24, fontWeight: "bold", marginBottom: 8},
  infoRow: {flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 8},
  ratingContainer: {flexDirection: "row", alignItems: "center", gap: 4},
  rating: {fontSize: 16, fontWeight: "600"},
  deliveryTime: {fontSize: 14, color: "#666"},
  deliveryFee: {fontSize: 14, color: colors.primary, fontWeight: "600"},
  address: {fontSize: 14, color: "#666", marginBottom: 8},
  description: {fontSize: 14, color: "#999", lineHeight: 20},
  menuSection: {padding: 16, borderTopWidth: 8, borderTopColor: "#f5f5f5"},
  menuTitle: {fontSize: 20, fontWeight: "bold", marginBottom: 16},
  emptyText: {fontSize: 16, color: "#999", textAlign: "center", paddingVertical: 20},
  productCard: {
    flexDirection: "row",
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  productImage: {width: 80, height: 80, borderRadius: 8},
  productInfo: {flex: 1, marginLeft: 12, justifyContent: "center"},
  productName: {fontSize: 16, fontWeight: "600", marginBottom: 4},
  productDescription: {fontSize: 12, color: "#666", marginBottom: 4},
  productPrice: {fontSize: 16, fontWeight: "bold", color: colors.primary},
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
});

export default RestaurantDetailScreen;
