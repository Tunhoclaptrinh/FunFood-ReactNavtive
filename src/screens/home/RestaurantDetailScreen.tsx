import React, {useEffect, useState, useRef} from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ImageBackground,
  Animated,
  Platform,
  StatusBar,
  Linking,
  Share,
} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {RestaurantService} from "@services/restaurant.service";
import {FavoriteService} from "@services/favorite.service";
import {useCart} from "@hooks/useCart";
import {useDebounce} from "@hooks/useDebounce";
import EmptyState from "@/src/components/common/EmptyState/EmptyState";
import {formatCurrency} from "@utils/formatters";
import {COLORS} from "@/src/styles/colors";
import SearchBar from "@/src/components/common/SearchBar";

const HEADER_HEIGHT = 250;

const RestaurantDetailScreen = ({route, navigation}: any) => {
  const {restaurantId} = route.params;
  const scrollY = useRef(new Animated.Value(0)).current;

  // --- State ---
  const [restaurant, setRestaurant] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [addingId, setAddingId] = useState<number | null>(null);

  const {addItem, items, totalPrice} = useCart();
  const debouncedSearch = useDebounce(searchQuery, 500);

  // --- Effects ---
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

  // --- Data Loading ---
  const loadRestaurantData = async () => {
    try {
      setLoading(true);
      const res = await RestaurantService.getById(restaurantId);
      setRestaurant(res);
      await loadMenu(1);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải thông tin nhà hàng");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const loadMenu = async (pageNum: number) => {
    try {
      setLoadingMenu(true);
      const res = (await RestaurantService.getMenu(restaurantId, pageNum, 20)) as any;

      const newProducts = pageNum === 1 ? res.data || [] : [...products, ...(res.data || [])];
      setProducts(newProducts);
      if (!searchQuery) setFilteredProducts(newProducts);

      setHasMore(res.pagination?.hasNext || false);
      setPage(pageNum);
    } catch (error) {
      console.error("Error loading menu:", error);
    } finally {
      setLoadingMenu(false);
    }
  };

  // --- Actions ---
  const handleToggleFavorite = async () => {
    try {
      setIsFavorite(!isFavorite);
      await FavoriteService.toggleFavorite("restaurant", restaurantId);
    } catch (error) {
      setIsFavorite(!isFavorite);
      console.error("Favorite error", error);
    }
  };

  const handlePhoneCall = () => {
    if (restaurant?.phone) {
      const phoneNumber = restaurant.phone.replace(/\s/g, "");
      Alert.alert("Gọi điện thoại", `Bạn muốn gọi đến ${restaurant.phone}?`, [
        {text: "Hủy", style: "cancel"},
        {
          text: "Gọi ngay",
          onPress: () => {
            Linking.openURL(`tel:${phoneNumber}`);
          },
        },
      ]);
    }
  };

  const handleOpenMap = () => {
    if (restaurant?.latitude && restaurant?.longitude) {
      const scheme = Platform.select({ios: "maps:", android: "geo:"});
      const latLng = `${restaurant.latitude},${restaurant.longitude}`;
      const label = encodeURIComponent(restaurant.name);

      const url = Platform.select({
        ios: `${scheme}?q=${label}&ll=${latLng}`,
        android: `${scheme}${latLng}?q=${label}`,
      });

      Linking.openURL(url as string).catch(() => {
        Alert.alert("Lỗi", "Không thể mở bản đồ");
      });
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Khám phá ${restaurant.name} - ${restaurant.description}\nĐịa chỉ: ${restaurant.address}\nĐánh giá: ${restaurant.rating}⭐`,
        title: restaurant.name,
      });
    } catch (error) {
      console.error("Share error", error);
    }
  };

  const filterProducts = (query: string) => {
    const filtered = products.filter(
      (p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(query.toLowerCase()))
    );
    setFilteredProducts(filtered);
  };

  const handleAddToCart = (product: any) => {
    setAddingId(product.id);
    addItem(product, 1);
    setTimeout(() => setAddingId(null), 300);
  };

  const cartItemCount = items.length;

  // --- Render UI ---
  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </View>
    );
  }

  if (!restaurant) return null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{nativeEvent: {contentOffset: {y: scrollY}}}], {useNativeDriver: false})}
        scrollEventThrottle={16}
      >
        {/* --- Restaurant Banner --- */}
        <ImageBackground source={{uri: restaurant.image}} style={styles.bannerImage}>
          <View style={styles.bannerOverlay} />
          <View style={styles.bannerContent}>
            <View style={styles.ratingTag}>
              <Ionicons name="star" size={14} color={COLORS.WHITE} />
              <Text style={styles.ratingText}>{restaurant.rating?.toFixed(1)}</Text>
            </View>
          </View>
        </ImageBackground>

        {/* --- Info Section --- */}
        <View style={styles.contentContainer}>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>
          {restaurant.description && <Text style={styles.restaurantDescription}>{restaurant.description}</Text>}
          <Text style={styles.restaurantAddress}>{restaurant.address}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color={COLORS.GRAY} />
              <Text style={styles.metaText}>{restaurant.deliveryTime || "30-40 phút"}</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={16} color={COLORS.GRAY} />
              <Text style={styles.metaText}>{restaurant.distance?.toFixed(1)} km</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Ionicons name="bicycle-outline" size={16} color={COLORS.GRAY} />
              <Text style={styles.metaText}>
                {restaurant.deliveryFee === 0 ? "Free" : formatCurrency(restaurant.deliveryFee || 15000)}
              </Text>
            </View>
          </View>

          {/* --- Action Buttons --- */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity style={styles.actionButton} onPress={handlePhoneCall}>
              <View style={[styles.actionIconCircle, {backgroundColor: "#E8F5E9"}]}>
                <Ionicons name="call" size={20} color="#4CAF50" />
              </View>
              <Text style={styles.actionButtonText}>Gọi điện</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleOpenMap}>
              <View style={[styles.actionIconCircle, {backgroundColor: "#E3F2FD"}]}>
                <Ionicons name="navigate" size={20} color="#2196F3" />
              </View>
              <Text style={styles.actionButtonText}>Chỉ đường</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <View style={[styles.actionIconCircle, {backgroundColor: "#FFF3E0"}]}>
                <Ionicons name="share-social-outline" size={20} color={COLORS.BLACK} />
              </View>
              <Text style={styles.actionButtonText}>Chia sẻ</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleToggleFavorite}>
              <View style={[styles.actionIconCircle, {backgroundColor: "#ffe0edff"}]}>
                <Ionicons
                  name={isFavorite ? "heart" : "heart-outline"}
                  size={20}
                  color={isFavorite ? COLORS.PRIMARY : COLORS.BLACK}
                />
              </View>
              <Text style={styles.actionButtonText}>Yêu thích</Text>
            </TouchableOpacity>
          </View>

          {/* --- Opening Hours --- */}
          {restaurant.openTime && restaurant.closeTime && (
            <View style={styles.hoursContainer}>
              <View style={styles.hoursRow}>
                <Ionicons name="time-outline" size={18} color={COLORS.GRAY} />
                <Text style={styles.hoursLabel}>Giờ mở cửa:</Text>
                <Text style={styles.hoursText}>
                  {restaurant.openTime} - {restaurant.closeTime}
                </Text>
                <View style={[styles.statusBadge, restaurant.isOpen ? styles.statusOpen : styles.statusClosed]}>
                  <Text style={[styles.statusText, {color: restaurant.isOpen ? "#2E7D32" : "#C62828"}]}>
                    {restaurant.isOpen ? "Đang mở" : "Đã đóng"}
                  </Text>
                </View>
              </View>
            </View>
          )}

          <View style={styles.divider} />

          {/* --- Search --- */}
          <View style={styles.searchSection}>
            <SearchBar
              placeholder="Tìm món ngon..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onClear={() => setSearchQuery("")}
              containerStyle={{backgroundColor: COLORS.LIGHT_GRAY, borderWidth: 0}}
            />
          </View>

          {/* --- Menu Grid --- */}
          <Text style={styles.sectionTitle}>Thực Đơn</Text>

          {filteredProducts.length > 0 ? (
            <View style={styles.menuGrid}>
              {filteredProducts.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.productItem}
                  onPress={() => navigation.push("ProductDetail", {productId: item.id})}
                  activeOpacity={0.8}
                >
                  <View style={styles.productImageContainer}>
                    <ImageBackground source={{uri: item.image}} style={styles.productImage} resizeMode="cover">
                      {item.discount > 0 && (
                        <View style={styles.discountTag}>
                          <Text style={styles.discountText}>-{item.discount}%</Text>
                        </View>
                      )}
                    </ImageBackground>
                  </View>

                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <View style={styles.priceRow}>
                      <Text style={styles.productPrice}>{formatCurrency(item.price)}</Text>
                      <TouchableOpacity style={styles.addBtnMini} onPress={() => handleAddToCart(item)}>
                        {addingId === item.id ? (
                          <ActivityIndicator size="small" color={COLORS.WHITE} />
                        ) : (
                          <Ionicons name="add" size={20} color={COLORS.WHITE} />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <EmptyState icon="search-outline" title="Không tìm thấy món ăn" subtitle="Hãy thử từ khóa khác" />
          )}

          {loadingMenu && <ActivityIndicator style={{marginVertical: 20}} color={COLORS.PRIMARY} />}

          <View style={{height: 100}} />
        </View>
      </ScrollView>

      {/* --- Floating Cart Bar --- */}
      {cartItemCount > 0 && (
        <View style={styles.floatingCartContainer}>
          <TouchableOpacity style={styles.viewCartButton} onPress={() => navigation.navigate("Cart")}>
            <View style={styles.cartCountCircle}>
              <Text style={styles.cartCountText}>{cartItemCount}</Text>
            </View>
            <View style={styles.cartInfoText}>
              <Text style={styles.viewCartText}>Xem giỏ hàng</Text>
              <Text style={styles.cartTotalText}>{formatCurrency(totalPrice)}</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color={COLORS.WHITE} />
          </TouchableOpacity>
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
  bannerImage: {
    width: "100%",
    height: HEADER_HEIGHT,
    justifyContent: "flex-end",
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  bannerContent: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  ratingTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  ratingText: {
    color: COLORS.WHITE,
    fontWeight: "bold",
    fontSize: 12,
  },
  contentContainer: {
    backgroundColor: COLORS.WHITE,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    marginTop: -10,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.DARK,
    marginBottom: 8,
  },
  restaurantDescription: {
    fontSize: 14,
    color: COLORS.DARK_GRAY,
    lineHeight: 20,
    marginBottom: 12,
  },
  restaurantAddress: {
    fontSize: 14,
    color: COLORS.GRAY,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: COLORS.DARK_GRAY,
    fontWeight: "500",
  },
  metaDivider: {
    width: 1,
    height: 14,
    backgroundColor: COLORS.BORDER,
    marginHorizontal: 12,
  },
  actionButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 20,
    paddingHorizontal: 10,
  },
  actionButton: {
    alignItems: "center",
    flex: 1,
  },
  actionIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 12,
    color: COLORS.DARK_GRAY,
    fontWeight: "500",
  },
  hoursContainer: {
    backgroundColor: "#F8F9FA",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  hoursRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  hoursLabel: {
    fontSize: 13,
    color: COLORS.GRAY,
    fontWeight: "500",
  },
  hoursText: {
    fontSize: 13,
    color: COLORS.DARK,
    fontWeight: "600",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusOpen: {
    backgroundColor: "#E8F5E9",
  },
  statusClosed: {
    backgroundColor: "#FFEBEE",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.LIGHT_GRAY,
    marginBottom: 20,
  },
  searchSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.DARK,
    marginBottom: 16,
  },
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  productItem: {
    width: "47%",
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.LIGHT_GRAY,
  },
  productImageContainer: {
    height: 140,
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  discountTag: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: COLORS.ERROR,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    color: COLORS.WHITE,
    fontSize: 10,
    fontWeight: "bold",
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.DARK,
    marginBottom: 8,
    height: 40,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.PRIMARY,
  },
  addBtnMini: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: "center",
    alignItems: "center",
  },
  floatingCartContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
  viewCartButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    shadowColor: COLORS.PRIMARY,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cartCountCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cartCountText: {
    color: COLORS.WHITE,
    fontWeight: "bold",
    fontSize: 12,
  },
  cartInfoText: {
    flex: 1,
  },
  viewCartText: {
    color: COLORS.WHITE,
    fontSize: 12,
    opacity: 0.9,
  },
  cartTotalText: {
    color: COLORS.WHITE,
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default RestaurantDetailScreen;
