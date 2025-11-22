import React, {useState, useEffect, useCallback} from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Image,
} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {useFocusEffect} from "@react-navigation/native";
import {FavoriteService} from "@services/favorite.service";
import EmptyState from "@components/common/EmptyState";
import {formatCurrency} from "@utils/formatters";
import {COLORS} from "@config/constants";

interface FavoriteItem {
  id: number;
  type: "restaurant" | "product";
  referenceId: number;
  restaurant?: any;
  product?: any;
}

const FavoritesListScreen = ({navigation}: any) => {
  const [activeTab, setActiveTab] = useState<"restaurant" | "product">("restaurant");
  const [restaurants, setRestaurants] = useState<FavoriteItem[]>([]);
  const [products, setProducts] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const [restaurantsRes, productsRes] = await Promise.all([
        FavoriteService.getFavorites("restaurant", 1, 50),
        FavoriteService.getFavorites("product", 1, 50),
      ]);

      setRestaurants((restaurantsRes as {data: FavoriteItem[]}).data || []);
      setProducts((productsRes as {data: FavoriteItem[]}).data || []);
    } catch (error) {
      console.error("Error loading favorites:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadFavorites();
  };

  const handleRemoveFavorite = async (type: "restaurant" | "product", id: number, name: string) => {
    Alert.alert("Remove Favorite", `Remove "${name}" from favorites?`, [
      {text: "Cancel", style: "cancel"},
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await FavoriteService.toggleFavorite(type, id);

            if (type === "restaurant") {
              setRestaurants(restaurants.filter((item) => item.referenceId !== id));
            } else {
              setProducts(products.filter((item) => item.referenceId !== id));
            }

            Alert.alert("Success", "Removed from favorites");
          } catch (error: any) {
            Alert.alert("Error", error.response?.data?.message || "Failed to remove favorite");
          }
        },
      },
    ]);
  };

  const handleRestaurantPress = (restaurantId: number) => {
    navigation.navigate("RestaurantDetail", {restaurantId});
  };

  const handleProductPress = (productId: number) => {
    navigation.navigate("ProductDetail", {productId});
  };

  const renderRestaurantItem = ({item}: {item: FavoriteItem}) => {
    const restaurant = item.restaurant || {};

    return (
      <TouchableOpacity style={styles.card} onPress={() => handleRestaurantPress(item.referenceId)} activeOpacity={0.7}>
        {/* Image */}
        <View style={styles.imageContainer}>
          {restaurant.image ? (
            <Image source={{uri: restaurant.image}} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.placeholderImage]}>
              <Ionicons name="storefront-outline" size={40} color={COLORS.LIGHT_GRAY} />
            </View>
          )}

          {/* Favorite Badge */}
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => handleRemoveFavorite("restaurant", item.referenceId, restaurant.name)}
          >
            <Ionicons name="heart" size={20} color={COLORS.ERROR} />
          </TouchableOpacity>

          {/* Open/Closed Badge */}
          <View style={[styles.statusBadge, {backgroundColor: restaurant.isOpen ? COLORS.SUCCESS : COLORS.ERROR}]}>
            <Text style={styles.statusText}>{restaurant.isOpen ? "Open" : "Closed"}</Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {restaurant.name || "Restaurant"}
          </Text>

          <View style={styles.cardInfo}>
            <View style={styles.infoRow}>
              <Ionicons name="star" size={14} color="#FFB800" />
              <Text style={styles.infoText}>{restaurant.rating?.toFixed(1) || "0.0"}</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={14} color={COLORS.GRAY} />
              <Text style={styles.infoText}>{restaurant.deliveryTime || "30-40m"}</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="bicycle-outline" size={14} color={COLORS.GRAY} />
              <Text style={styles.infoText}>{formatCurrency(restaurant.deliveryFee || 15000)}</Text>
            </View>
          </View>

          {restaurant.address && (
            <Text style={styles.cardAddress} numberOfLines={1}>
              {restaurant.address}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderProductItem = ({item}: {item: FavoriteItem}) => {
    const product = item.product || {};

    return (
      <TouchableOpacity style={styles.card} onPress={() => handleProductPress(item.referenceId)} activeOpacity={0.7}>
        {/* Image */}
        <View style={styles.imageContainer}>
          {product.image ? (
            <Image source={{uri: product.image}} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.placeholderImage]}>
              <Ionicons name="fast-food-outline" size={40} color={COLORS.LIGHT_GRAY} />
            </View>
          )}

          {/* Favorite Badge */}
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => handleRemoveFavorite("product", item.referenceId, product.name)}
          >
            <Ionicons name="heart" size={20} color={COLORS.ERROR} />
          </TouchableOpacity>

          {/* Discount Badge */}
          {product.discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{product.discount}% OFF</Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {product.name || "Product"}
          </Text>

          <View style={styles.priceContainer}>
            {product.discount > 0 ? (
              <>
                <Text style={styles.originalPrice}>{formatCurrency(product.price)}</Text>
                <Text style={styles.finalPrice}>{formatCurrency(product.price * (1 - product.discount / 100))}</Text>
              </>
            ) : (
              <Text style={styles.finalPrice}>{formatCurrency(product.price)}</Text>
            )}
          </View>

          <View style={styles.cardInfo}>
            {product.rating && (
              <View style={styles.infoRow}>
                <Ionicons name="star" size={14} color="#FFB800" />
                <Text style={styles.infoText}>{product.rating.toFixed(1)}</Text>
              </View>
            )}

            <View style={[styles.availableBadge, {backgroundColor: product.available ? "#E8F8F1" : "#FFEBEE"}]}>
              <Text style={[styles.availableText, {color: product.available ? COLORS.SUCCESS : COLORS.ERROR}]}>
                {product.available ? "Available" : "Out of Stock"}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const currentData = activeTab === "restaurant" ? restaurants : products;
  const renderItem = activeTab === "restaurant" ? renderRestaurantItem : renderProductItem;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Loading favorites...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "restaurant" && styles.tabActive]}
          onPress={() => setActiveTab("restaurant")}
          activeOpacity={0.7}
        >
          <Ionicons
            name="storefront-outline"
            size={20}
            color={activeTab === "restaurant" ? COLORS.PRIMARY : COLORS.GRAY}
          />
          <Text style={[styles.tabText, activeTab === "restaurant" && styles.tabTextActive]}>Restaurants</Text>
          {restaurants.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{restaurants.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "product" && styles.tabActive]}
          onPress={() => setActiveTab("product")}
          activeOpacity={0.7}
        >
          <Ionicons name="fast-food-outline" size={20} color={activeTab === "product" ? COLORS.PRIMARY : COLORS.GRAY} />
          <Text style={[styles.tabText, activeTab === "product" && styles.tabTextActive]}>Products</Text>
          {products.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{products.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Content */}
      {currentData.length === 0 ? (
        <EmptyState
          icon={activeTab === "restaurant" ? "storefront-outline" : "fast-food-outline"}
          title={`No Favorite ${activeTab === "restaurant" ? "Restaurants" : "Products"}`}
          subtitle={`Start adding your favorite ${activeTab === "restaurant" ? "restaurants" : "products"} here`}
          containerStyle={styles.emptyState}
        />
      ) : (
        <FlatList
          data={currentData}
          keyExtractor={(item) => `${item.type}-${item.id}`}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.PRIMARY]}
              tintColor={COLORS.PRIMARY}
            />
          }
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.GRAY,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: COLORS.LIGHT_GRAY,
    gap: 6,
  },
  tabActive: {
    backgroundColor: "#FFE5E5",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.GRAY,
  },
  tabTextActive: {
    color: COLORS.PRIMARY,
  },
  badge: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "bold",
    color: COLORS.WHITE,
  },
  emptyState: {
    flex: 1,
  },
  listContent: {
    padding: 12,
  },
  columnWrapper: {
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 120,
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    justifyContent: "center",
    alignItems: "center",
  },
  favoriteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.WHITE,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  statusBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.WHITE,
  },
  discountBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: COLORS.ERROR,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    fontSize: 10,
    fontWeight: "bold",
    color: COLORS.WHITE,
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.DARK,
    marginBottom: 6,
  },
  cardInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    color: COLORS.GRAY,
    fontWeight: "500",
  },
  cardAddress: {
    fontSize: 11,
    color: COLORS.GRAY,
    marginTop: 4,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  originalPrice: {
    fontSize: 12,
    color: COLORS.GRAY,
    textDecorationLine: "line-through",
  },
  finalPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.PRIMARY,
  },
  availableBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  availableText: {
    fontSize: 10,
    fontWeight: "600",
  },
});

export default FavoritesListScreen;
