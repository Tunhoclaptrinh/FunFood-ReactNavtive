import React, {useEffect, useState, useRef} from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Image,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  Animated,
  ImageBackground,
  Platform,
} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {ProductService} from "@services/product.service";
import {ReviewService} from "@services/review.service";
import {useCart} from "@hooks/useCart";
import {useFavoriteStore} from "@/src/stores/favoriteStore";
import Button from "@/src/components/common/Button";
import {formatCurrency} from "@utils/formatters";
import {COLORS} from "@/src/styles/colors";
import {ReviewItem} from "@/src/components/reviews/ReviewItem";
import {WriteReviewModal} from "@/src/components/reviews/WriteReviewModal";

const HEADER_HEIGHT = 300;

const ProductDetailScreen = ({route, navigation}: any) => {
  const {productId} = route.params;
  const scrollY = useRef(new Animated.Value(0)).current;

  const {addItem} = useCart();
  const {isFavorite, toggleFavorite, fetchFavorites} = useFavoriteStore();

  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const isLiked = isFavorite("product", productId);

  useEffect(() => {
    loadData();
    fetchFavorites();
  }, [productId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await ProductService.getWithRestaurant(productId);
      setProduct(res);
      try {
        const reviewsRes = await ReviewService.getProductReviews(productId, 1, 3);
        setReviews((reviewsRes as any)?.data || []);
      } catch {}
    } catch {
      Alert.alert("Lỗi", "Không thể tải thông tin món ăn");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (rating: number, comment: string) => {
    try {
      setIsSubmittingReview(true);
      await ReviewService.createReview({
        type: "product",
        restaurantId: product.restaurantId, // Product review cần cả ID nhà hàng
        productId: productId,
        rating,
        comment,
      });

      Alert.alert("Thành công", "Đánh giá món ăn thành công!");
      setShowReviewModal(false);

      // Reload reviews
      const reviewsRes = await ReviewService.getProductReviews(productId, 1, 5);
      setReviews((reviewsRes as any)?.data || []);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể gửi đánh giá.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleToggleFavorite = () => toggleFavorite("product", productId);
  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      Alert.alert("Đã thêm vào giỏ", `Bạn đã thêm ${quantity} ${product.name}`, [
        {text: "Xem tiếp", style: "cancel"},
        {text: "Đến giỏ hàng", onPress: () => navigation.navigate("Cart")},
      ]);
    }
  };

  const goToRestaurant = () => {
    if (product?.restaurantId) {
      navigation.push("RestaurantDetail", {restaurantId: product.restaurantId});
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
      <StatusBar barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 100}}
        onScroll={Animated.event([{nativeEvent: {contentOffset: {y: scrollY}}}], {useNativeDriver: false})}
        scrollEventThrottle={16}
      >
        {/* --- Hero Image --- */}
        <ImageBackground source={{uri: product.image}} style={styles.heroImage} resizeMode="cover">
          <View style={styles.imageOverlay} />

          {/* Badge Rating góc dưới trái */}
          <View style={styles.ratingTag}>
            <Ionicons name="star" size={14} color={COLORS.WHITE} />
            <Text style={styles.ratingTagText}>{(product.rating || 5.0).toFixed(1)}</Text>
          </View>

          {/* Discount Badge góc trên phải */}
          {product.discount > 0 && (
            <View style={styles.discountBadgeTopRight}>
              <Text style={styles.discountTextTopRight}>GIẢM {product.discount}%</Text>
            </View>
          )}
        </ImageBackground>

        <View style={styles.contentContainer}>
          {/* Header Info */}
          <View style={styles.headerInfo}>
            <View style={{flex: 1, paddingRight: 10}}>
              <Text style={styles.productName}>{product.name}</Text>

              <View style={styles.ratingRow}>
                <Text style={styles.categoryText}>Danh mục</Text>
                <View style={styles.dot} />
                <Text style={styles.categoryText}>{product.category?.name || "Món ngon"}</Text>
              </View>
            </View>
            {/* --- Header Buttons (Share + Favorite) --- */}
            <View style={styles.actionButtons}>
              <TouchableOpacity onPress={handleToggleFavorite} style={styles.actionIconCircle}>
                <Ionicons
                  name={isLiked ? "heart" : "heart-outline"}
                  size={24}
                  color={isLiked ? COLORS.PRIMARY : COLORS.BLACK}
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionIconCircle}>
                <Ionicons name="share-social-outline" size={22} color={COLORS.BLACK} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.finalPrice}>{formatCurrency(finalPrice)}</Text>
            {product.discount > 0 && <Text style={styles.originalPrice}>{formatCurrency(product.price)}</Text>}
          </View>

          <View style={styles.divider} />

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mô tả</Text>
            <Text style={styles.description}>
              {product.description || "Món ăn tươi ngon, đảm bảo vệ sinh an toàn thực phẩm."}
            </Text>
          </View>

          {/* Restaurant Card */}
          {product.restaurant && (
            <TouchableOpacity style={styles.restaurantCard} onPress={goToRestaurant} activeOpacity={0.8}>
              <Image source={{uri: product.restaurant.image}} style={styles.restaurantAvatar} />
              <View style={{flex: 1, marginLeft: 8}}>
                <Text style={styles.restaurantLabel}>Được bán bởi</Text>
                <Text style={styles.restaurantName} numberOfLines={1}>
                  {product.restaurant.name}
                </Text>
              </View>
              <View style={styles.visitButton}>
                <Text style={styles.visitText}>Xem</Text>
                <Ionicons name="chevron-forward" size={14} color={COLORS.PRIMARY} />
              </View>
            </TouchableOpacity>
          )}

          <View style={styles.divider} />

          {/* Reviews */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Đánh giá</Text>
              <TouchableOpacity onPress={() => setShowReviewModal(true)}>
                <Text style={{color: COLORS.PRIMARY, fontWeight: "600", fontSize: 13}}>Viết đánh giá</Text>
              </TouchableOpacity>
            </View>

            {reviews.length === 0 ? (
              <Text style={{color: COLORS.GRAY, fontStyle: "italic", marginTop: 8}}>Chưa có đánh giá nào.</Text>
            ) : (
              // Thay thế code map cũ bằng ReviewItem
              reviews.map((review) => <ReviewItem key={review.id} review={review} />)
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.quantityControl}>
          <TouchableOpacity
            style={[styles.qtyBtn, quantity <= 1 && styles.qtyBtnDisabled]}
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
          >
            <Ionicons name="remove" size={20} color={quantity <= 1 ? COLORS.GRAY : COLORS.DARK} />
          </TouchableOpacity>

          <Text style={styles.qtyValue}>{quantity}</Text>

          <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(Math.min(20, quantity + 1))}>
            <Ionicons name="add" size={20} color={COLORS.DARK} />
          </TouchableOpacity>
        </View>

        <Button
          title={`Thêm • ${formatCurrency(finalPrice * quantity)}`}
          onPress={handleAddToCart}
          containerStyle={{flex: 1}}
          disabled={!product.available}
          leftIcon="cart-outline"
        />
      </View>
      <WriteReviewModal
        visible={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSubmit={handleSubmitReview}
        isSubmitting={isSubmittingReview}
        title={`Đánh giá món ăn`}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.WHITE},
  centered: {justifyContent: "center", alignItems: "center"},
  heroImage: {
    width: "100%",
    height: HEADER_HEIGHT,
    justifyContent: "flex-end",
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  ratingTag: {
    position: "absolute",
    bottom: 40,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  ratingTagText: {
    color: COLORS.WHITE,
    fontWeight: "bold",
    fontSize: 12,
  },
  discountBadgeTopRight: {
    position: "absolute",
    bottom: 40,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.ERROR,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountTextTopRight: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: "bold",
  },

  contentContainer: {
    backgroundColor: COLORS.WHITE,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    marginTop: -30,
    paddingHorizontal: 20,
    paddingTop: 24,
    minHeight: 500,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  actionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 22,
    backgroundColor: COLORS.LIGHT_GRAY,
    justifyContent: "center",
    alignItems: "center",
  },
  headerInfo: {flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start"},
  productName: {fontSize: 22, fontWeight: "bold", color: COLORS.DARK, lineHeight: 28, marginBottom: 6},
  ratingRow: {flexDirection: "row", alignItems: "center", gap: 6},
  ratingText: {fontSize: 13, color: COLORS.DARK_GRAY, fontWeight: "600"},
  dot: {width: 4, height: 4, borderRadius: 2, backgroundColor: COLORS.GRAY},
  categoryText: {fontSize: 13, color: COLORS.GRAY},
  discountTag: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: COLORS.ERROR,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountText: {color: COLORS.WHITE, fontSize: 10, fontWeight: "bold"},
  priceContainer: {flexDirection: "row", alignItems: "baseline", marginTop: 12, gap: 10},
  finalPrice: {fontSize: 24, fontWeight: "800", color: COLORS.PRIMARY},
  originalPrice: {fontSize: 16, color: COLORS.GRAY, textDecorationLine: "line-through"},
  divider: {height: 1, backgroundColor: "#F0F0F0", marginVertical: 20},
  section: {marginBottom: 16},
  sectionTitle: {fontSize: 16, fontWeight: "700", color: COLORS.DARK, marginBottom: 8},
  description: {fontSize: 14, color: COLORS.DARK_GRAY, lineHeight: 22},
  restaurantCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    marginBottom: 10,
  },
  restaurantAvatar: {width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.LIGHT_GRAY},
  restaurantLabel: {fontSize: 11, color: COLORS.GRAY, marginBottom: 2},
  restaurantName: {fontSize: 15, fontWeight: "700", color: COLORS.DARK},
  visitButton: {flexDirection: "row", alignItems: "center", padding: 4},
  visitText: {fontSize: 12, color: COLORS.PRIMARY, fontWeight: "600"},
  sectionHeader: {flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12},
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 20,
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 4,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.WHITE,
    borderRadius: 10,
  },
  qtyBtnDisabled: {opacity: 0.5, backgroundColor: "transparent"},
  qtyValue: {fontSize: 16, fontWeight: "bold", color: COLORS.DARK, width: 40, textAlign: "center"},
});

export default ProductDetailScreen;
