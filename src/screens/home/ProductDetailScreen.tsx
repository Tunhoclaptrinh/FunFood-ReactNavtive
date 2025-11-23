import React, {useEffect, useState} from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Image,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Platform,
} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {ProductService} from "@services/product.service";
import {ReviewService} from "@services/review.service";
import {FavoriteService} from "@services/favorite.service";
import {useCart} from "@hooks/useCart";
import Button from "@/src/components/common/Button";
import {formatCurrency} from "@utils/formatters";
import {COLORS} from "@/src/styles/colors";

const ProductDetailScreen = ({route, navigation}: any) => {
  const {productId} = route.params;

  // --- State ---
  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  const {addItem} = useCart();

  // --- Effects ---
  useEffect(() => {
    loadProductData();
  }, [productId]);

  // --- Load Data ---
  const loadProductData = async () => {
    try {
      setLoading(true);
      const res = await ProductService.getById(productId);
      setProduct(res);
      // setIsFavorite(res.isFavorite); // Giả sử API trả về

      // Load review mẫu (nếu API lỗi thì bỏ qua)
      try {
        const reviewsRes = await ReviewService.getRestaurantReviews(res.restaurantId, 1, 3);
        setReviews((reviewsRes as any)?.data || []);
      } catch (e) {}
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải thông tin món ăn");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers ---
  const handleToggleFavorite = async () => {
    setIsFavorite(!isFavorite);
    // Gọi API update favorite
    try {
      await FavoriteService.toggleFavorite("product", productId);
    } catch (e) {
      setIsFavorite(!isFavorite);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      navigation.goBack();
      Alert.alert("Thành công", `Đã thêm ${quantity} ${product.name} vào giỏ hàng`);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </View>
    );
  }

  if (!product) return null;

  const finalPrice = product.price * (1 - (product.discount || 0) / 100);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* --- Header Nav --- */}
      <View style={styles.navHeader}>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.DARK} />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>
          {product.name}
        </Text>
        <TouchableOpacity style={styles.navBtn} onPress={handleToggleFavorite}>
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={24}
            color={isFavorite ? COLORS.PRIMARY : COLORS.DARK}
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 120}}>
        {/* --- Image --- */}
        <View style={styles.imageWrapper}>
          {product.image ? (
            <Image source={{uri: product.image}} style={styles.productImage} resizeMode="cover" />
          ) : (
            <View style={[styles.productImage, styles.placeholderImage]}>
              <Ionicons name="fast-food" size={60} color={COLORS.GRAY} />
            </View>
          )}
          {product.discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>GIẢM {product.discount}%</Text>
            </View>
          )}
        </View>

        {/* --- Info --- */}
        <View style={styles.infoContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.productName}>{product.name}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFB800" />
              <Text style={styles.ratingText}>{product.rating || 5.0}</Text>
            </View>
          </View>

          <Text style={styles.description}>
            {product.description || "Món ăn ngon tuyệt vời, được chế biến từ nguyên liệu tươi sạch."}
          </Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Đơn giá:</Text>
            <View style={{flexDirection: "row", alignItems: "baseline", gap: 8}}>
              {product.discount > 0 && <Text style={styles.originalPrice}>{formatCurrency(product.price)}</Text>}
              <Text style={styles.finalPrice}>{formatCurrency(finalPrice)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* --- Quantity --- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Số lượng</Text>
          <View style={styles.quantityRow}>
            <TouchableOpacity
              style={[styles.qtyBtn, quantity <= 1 && styles.qtyBtnDisabled]}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              <Ionicons name="remove" size={24} color={quantity <= 1 ? COLORS.GRAY : COLORS.DARK} />
            </TouchableOpacity>

            <Text style={styles.qtyValue}>{quantity}</Text>

            <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(Math.min(20, quantity + 1))}>
              <Ionicons name="add" size={24} color={COLORS.DARK} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        {/* --- Reviews Preview --- */}
        <View style={styles.section}>
          <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12}}>
            <Text style={styles.sectionTitle}>Đánh giá ({reviews.length})</Text>
            <TouchableOpacity>
              <Text style={{color: COLORS.PRIMARY, fontSize: 13, fontWeight: "600"}}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          {reviews.length === 0 ? (
            <Text style={{color: COLORS.GRAY, fontStyle: "italic"}}>Chưa có đánh giá nào.</Text>
          ) : (
            reviews.map((review, index) => (
              <View key={index} style={styles.reviewItem}>
                <View style={{flexDirection: "row", gap: 4, marginBottom: 4}}>
                  {Array.from({length: 5}).map((_, i) => (
                    <Ionicons key={i} name={i < review.rating ? "star" : "star-outline"} size={12} color="#FFB800" />
                  ))}
                </View>
                <Text style={styles.reviewText}>{review.comment}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* --- Bottom Action --- */}
      <View style={styles.bottomBar}>
        <View style={styles.totalInfo}>
          <Text style={{fontSize: 12, color: COLORS.GRAY}}>Tổng tiền</Text>
          <Text style={{fontSize: 20, fontWeight: "bold", color: COLORS.DARK}}>
            {formatCurrency(finalPrice * quantity)}
          </Text>
        </View>
        <Button
          title="Thêm vào giỏ"
          onPress={handleAddToCart}
          containerStyle={{width: 150, marginLeft: 20, marginRight: 0}}
          disabled={!product.available}
        />
      </View>
    </View>
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
  navHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 0,
    paddingTop: Platform.OS === "android" ? 10 : 10,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
  },
  navBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  navTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.DARK,
    marginHorizontal: 10,
  },
  imageWrapper: {
    width: "100%",
    height: 300,
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    alignItems: "center",
    justifyContent: "center",
  },
  discountBadge: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: COLORS.ERROR,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  discountText: {
    color: COLORS.WHITE,
    fontWeight: "bold",
    fontSize: 12,
  },
  infoContainer: {
    padding: 20,
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  productName: {
    flex: 1,
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.DARK,
    marginRight: 10,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8E1",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  ratingText: {
    color: "#FFB800",
    fontWeight: "bold",
    fontSize: 14,
  },
  description: {
    fontSize: 14,
    color: COLORS.GRAY,
    lineHeight: 22,
    marginBottom: 20,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.LIGHT_GRAY,
    padding: 16,
    borderRadius: 12,
  },
  priceLabel: {
    fontSize: 14,
    color: COLORS.DARK_GRAY,
  },
  originalPrice: {
    fontSize: 14,
    color: COLORS.GRAY,
    textDecorationLine: "line-through",
  },
  finalPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.PRIMARY,
  },
  divider: {
    height: 8,
    backgroundColor: COLORS.LIGHT_GRAY,
    opacity: 0.5,
  },
  section: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.DARK,
    marginBottom: 8,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 22,
    backgroundColor: COLORS.LIGHT_GRAY,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyBtnDisabled: {
    opacity: 0.5,
  },
  qtyValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.DARK,
    width: 40,
    textAlign: "center",
  },
  reviewItem: {
    padding: 12,
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 12,
    marginBottom: 10,
  },
  reviewText: {
    fontSize: 13,
    color: COLORS.DARK,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === "ios" ? 30 : 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 10,
  },
  totalInfo: {
    justifyContent: "center",
  },
});

export default ProductDetailScreen;
