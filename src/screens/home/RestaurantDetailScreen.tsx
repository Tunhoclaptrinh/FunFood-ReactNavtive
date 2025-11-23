import React, {useEffect, useState} from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {RestaurantService} from "@services/restaurant.service";
import {ProductService} from "@services/product.service";
import {useCart} from "@hooks/useCart";
import {useDebounce} from "@hooks/useDebounce";
import Button from "@/src/components/common/Button";
import EmptyState from "@/src/components/common/EmptyState/EmptyState";
import {formatCurrency, formatDistance} from "@utils/formatters";
import {COLORS} from "@/src/styles/colors";
import SearchBar from "@/src/components/common/SearchBar";
import Card from "@/src/components/common/Card/Card";

interface RouteParams {
  restaurantId: number;
}

const RestaurantDetailScreen = ({route, navigation}: any) => {
  const {restaurantId} = route.params as RouteParams;
  const [restaurant, setRestaurant] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const {addItem, items} = useCart();

  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    loadRestaurantData();
  }, [restaurantId]);

  useEffect(() => {
    if (debouncedSearch) {
      filterProducts(debouncedSearch);
    } else {
      setFilteredProducts(products);
    }
  }, [debouncedSearch, products]);

  const loadRestaurantData = async () => {
    try {
      setLoading(true);
      const res = (await RestaurantService.getById(restaurantId)) as any;
      setRestaurant(res);
      await loadMenu(1);
    } catch (error) {
      console.error("Error loading restaurant:", error);
      Alert.alert("Error", "Failed to load restaurant details");
    } finally {
      setLoading(false);
    }
  };

  const loadMenu = async (pageNum: number) => {
    try {
      setLoadingMenu(true);
      const res = (await RestaurantService.getMenu(restaurantId, pageNum, 10)) as any;

      if (pageNum === 1) {
        setProducts(res.data || []);
        setFilteredProducts(res.data || []);
      } else {
        setProducts([...products, ...(res.data || [])]);
        setFilteredProducts([...filteredProducts, ...(res.data || [])]);
      }

      setHasMore(res.pagination?.hasNext || false);
      setPage(pageNum);
    } catch (error) {
      console.error("Error loading menu:", error);
    } finally {
      setLoadingMenu(false);
    }
  };

  const filterProducts = (query: string) => {
    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const handleAddToCart = (product: any) => {
    addItem(product, 1);
    Alert.alert("Success", `${product.name} added to cart!`);
  };

  const handleProductPress = (product: any) => {
    navigation.push("ProductDetail", {productId: product.id});
  };

  const handleLoadMore = () => {
    if (hasMore && !loadingMenu) {
      loadMenu(page + 1);
    }
  };

  const cartItemCount = items.length;

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </View>
    );
  }

  if (!restaurant) {
    return (
      <View style={[styles.container, styles.centered]}>
        <EmptyState icon="alert-outline" title="Restaurant not found" subtitle="Please go back and try again" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[1]}>
        {/* Restaurant Header */}
        <View>
          <Card
            image={restaurant.image}
            title={restaurant.name}
            subtitle={restaurant.address}
            rating={restaurant.rating}
            description={`${restaurant.distance?.toFixed(1) || "0"}km • ${restaurant.deliveryTime || "30-40 min"}`}
            badge={restaurant.isOpen ? "Open" : "Closed"}
            style={{borderRadius: 0, paddingBottom: 0, marginBottom: 4}}
          />

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="time-outline" size={20} color={COLORS.PRIMARY} />
                <Text style={styles.infoText}>{restaurant.deliveryTime || "30-40"}</Text>
              </View>

              <View style={styles.infoItem}>
                <Ionicons name="location-outline" size={20} color={COLORS.PRIMARY} />
                <Text style={styles.infoText}>{restaurant.distance?.toFixed(1) || "0"}km</Text>
              </View>

              <View style={styles.infoItem}>
                <Ionicons name="bicycle-outline" size={20} color={COLORS.PRIMARY} />
                <Text style={styles.infoText}>{formatCurrency(restaurant.deliveryFee || 15000)}</Text>
              </View>

              <View style={styles.infoItem}>
                <Ionicons name="star" size={20} color="#FFB800" />
                <Text style={styles.infoText}>{restaurant.rating?.toFixed(1) || "0"}</Text>
              </View>
            </View>

            {restaurant.description && <Text style={styles.description}>{restaurant.description}</Text>}
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBarContainer}>
            <SearchBar
              placeholder="Search menu..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onClear={() => setSearchQuery("")}
            />
          </View>
        </View>

        {/* Menu Section */}
        <View style={styles.menuSection}>
          <Text style={styles.menuTitle}>Menu</Text>

          {filteredProducts.length > 0 ? (
            <FlatList
              data={filteredProducts}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              columnWrapperStyle={styles.columnWrapper}
              renderItem={({item}) => (
                <View style={styles.gridProductCard}>
                  <TouchableOpacity
                    style={styles.productContent}
                    onPress={() => handleProductPress(item)}
                    activeOpacity={0.7}
                  >
                    <Card
                      image={item.image}
                      title={item.name}
                      subtitle={formatCurrency(item.price)}
                      rating={item.rating}
                      badge={item.discount ? `${item.discount}% OFF` : undefined}
                      description={item.description}
                      style={styles.cardStyle}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.addButton} onPress={() => handleAddToCart(item)}>
                    <Ionicons name="add-circle" size={52} color={COLORS.PRIMARY} />
                  </TouchableOpacity>
                </View>
              )}
              scrollEnabled={false}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                loadingMenu ? (
                  <ActivityIndicator size="small" color={COLORS.PRIMARY} style={styles.loadingFooter} />
                ) : null
              }
            />
          ) : (
            <EmptyState
              icon="fast-food-outline"
              title={searchQuery ? "No products found" : "No menu items available"}
              subtitle={searchQuery ? "Try different search terms" : "Check back later"}
            />
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Cart Button */}
      {cartItemCount > 0 && (
        <View style={styles.cartFooter}>
          <View style={styles.cartButton}>
            <Button title={`View Cart (${cartItemCount})`} onPress={() => navigation.navigate("Cart")} />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  infoSection: {
    padding: 16,
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  infoItem: {
    alignItems: "center",
  },
  infoText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.DARK,
    marginTop: 4,
  },
  description: {
    fontSize: 13,
    color: COLORS.GRAY,
    lineHeight: 20,
    textAlign: "center",
  },
  searchContainer: {
    padding: 12,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
  },
  searchBarContainer: {
    backgroundColor: COLORS.WHITE,
    height: "100%",
  },
  menuSection: {
    padding: 0,
    margin: 16,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: COLORS.DARK,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  gridProductCard: {
    width: "46%",
  },
  productContent: {
    flex: 1,
  },
  cardStyle: {
    borderRadius: 4,
  },
  addButton: {
    position: "absolute",
    bottom: -8,
    right: -8,
    width: 52,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingFooter: {
    marginVertical: 16,
  },
  bottomPadding: {
    height: 100,
  },
  cartFooter: {
    padding: 12,
    backgroundColor: COLORS.WHITE,
    borderTopWidth: 1,
    borderTopColor: COLORS.LIGHT_GRAY,
    elevation: 5,
    shadowColor: COLORS.BLACK,
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cartButton: {
    width: "100%",
  },
});

export default RestaurantDetailScreen;
