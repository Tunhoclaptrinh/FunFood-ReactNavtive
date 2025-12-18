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
  FlatList,
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
  const priceScale = useRef(new Animated.Value(1)).current;

  const {addToCart, isLoading} = useCart();
  const {isFavorite, toggleFavorite, fetchFavorites} = useFavoriteStore();

  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number | null>(null);
  const [reviewSort, setReviewSort] = useState<"latest" | "helpful">("helpful");
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  const isLiked = isFavorite("product", productId);

  // Animation cho header opacity
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT - 100],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT - 80, HEADER_HEIGHT - 60],
    outputRange: [0, 0, 1],
    extrapolate: "clamp",
  });

  useEffect(() => {
    loadData();
    fetchFavorites();
  }, [productId]);

  useEffect(() => {
    // Animation cho giá khi có discount
    if (product?.discount > 0) {
      Animated.sequence([
        Animated.spring(priceScale, {
          toValue: 1.1,
          useNativeDriver: true,
        }),
        Animated.spring(priceScale, {
          toValue: 1,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [product]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await ProductService.getWithRestaurant(productId);
      setProduct(res);
      
      // Load reviews
      try {
        const reviewsRes = await ReviewService.getProductReviews(productId, 1, 10);
        setReviews((reviewsRes as any)?.data || []);
      } catch {}

      // Load related products (mock data - thay bằng API thực tế)
      try {
        const relatedRes = await ProductService.getRelated(productId);
        setRelatedProducts(relatedRes?.slice(0, 5) || []);
      } catch {
        // Mock data nếu không có API
        setRelatedProducts([
          {id: 1, name: "Pizza Hải Sản", price: 159000, image: "https://via.placeholder.com/150", rating: 4.8},
          {id: 2, name: "Pizza Pepperoni", price: 129000, image: "https://via.placeholder.com/150", rating: 4.7},
          {id: 3, name: "Pizza Veggie", price: 119000, image: "https://via.placeholder.com/150", rating: 4.6},
        ]);
      }
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
        restaurantId: product.restaurantId,
        productId: productId,
        rating,
        comment,
      });

      Alert.alert("Thành công", "Đánh giá món ăn thành công!");
      setShowReviewModal(false);

      const reviewsRes = await ReviewService.getProductReviews(productId, 1, 10);
      setReviews((reviewsRes as any)?.data || []);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể gửi đánh giá.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleToggleFavorite = () => toggleFavorite("product", productId);

  const handleAddToCart = async () => {
    if (!product) return;

    const success = await addToCart(product, quantity);

    if (success) {
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

  // Calculate rating breakdown
  const getRatingBreakdown = () => {
    const breakdown = {5: 0, 4: 0, 3: 0, 2: 0, 1: 0};
    reviews.forEach((review) => {
      const rating = Math.floor(review.rating);
      breakdown[rating as keyof typeof breakdown]++;
    });
    const total = reviews.length || 1;
    return Object.entries(breakdown).reverse().map(([star, count]) => ({
      star: parseInt(star),
      count,
      percentage: (count / total) * 100,
    }));
  };

  // Filter reviews
  const getFilteredReviews = () => {
    let filtered = [...reviews];
    
    if (selectedRatingFilter) {
      filtered = filtered.filter(r => Math.floor(r.rating) === selectedRatingFilter);
    }
    
    if (reviewSort === "helpful") {
      filtered.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
    } else {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    
    return filtered;
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
  const filteredReviews = getFilteredReviews();
  const ratingBreakdown = getRatingBreakdown();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Floating Header with fade effect */}
      <Animated.View style={[styles.floatingHeader, {opacity: headerOpacity}]}>
        <View style={styles.floatingHeaderContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.DARK} />
          </TouchableOpacity>
          
          <Animated.Text style={[styles.headerTitle, {opacity: headerTitleOpacity}]} numberOfLines={1}>
            {product.name}
          </Animated.Text>
          
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="share-social-outline" size={22} color={COLORS.DARK} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 100}}
        onScroll={Animated.event([{nativeEvent: {contentOffset: {y: scrollY}}}], {useNativeDriver: false})}
        scrollEventThrottle={16}
      >
        {/* Hero Image with overlay buttons */}
        <ImageBackground source={{uri: product.image}} style={styles.heroImage} resizeMode="cover">
          <View style={styles.imageOverlay} />

          {/* Top overlay buttons */}
          <View style={styles.topOverlayButtons}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.overlayButton}>
              <Ionicons name="arrow-back" size={24} color={COLORS.WHITE} />
            </TouchableOpacity>
            
            <View style={{flexDirection: "row", gap: 8}}>
              <TouchableOpacity onPress={handleToggleFavorite} style={styles.overlayButton}>
                <Ionicons
                  name={isLiked ? "heart" : "heart-outline"}
                  size={24}
                  color={isLiked ? COLORS.PRIMARY : COLORS.WHITE}
                />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.overlayButton}>
                <Ionicons name="share-social-outline" size={22} color={COLORS.WHITE} />
              </TouchableOpacity>
            </View>
          </View>

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

          {/* Badge Bán chạy/Hot góc trên trái */}
          <View style={styles.hotBadge}>
            <Ionicons name="flame" size={14} color="#FF6B35" />
            <Text style={styles.hotBadgeText}>Bán chạy</Text>
          </View>
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
          </View>

          {/* Price with animation */}
          <Animated.View style={[styles.priceContainer, {transform: [{scale: priceScale}]}]}>
            <View style={styles.priceColumn}>
              <View style={styles.priceWithIcon}>
                <Ionicons name="pricetag" size={20} color={COLORS.PRIMARY} />
                <Text style={styles.finalPrice}>{formatCurrency(finalPrice)}</Text>
              </View>
              {product.discount > 0 && (
                <View style={styles.priceRow}>
                  <Text style={styles.originalPrice}>{formatCurrency(product.price)}</Text>
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountBadgeText}>-{product.discount}%</Text>
                  </View>
                </View>
              )}
            </View>
          </Animated.View>

          {/* Tiết kiệm - Enhanced */}
          {product.discount > 0 && (
            <View style={styles.savingContainerEnhanced}>
              <Ionicons name="gift" size={18} color="#00B14F" />
              <Text style={styles.savingTextEnhanced}>
                Bạn tiết kiệm được {formatCurrency(product.price - finalPrice)}
              </Text>
            </View>
          )}

          {/* Đã bán */}
          <View style={styles.soldContainer}>
            <Ionicons name="bag-check-outline" size={16} color={COLORS.PRIMARY} />
            <Text style={styles.soldText}>Đã bán 100+</Text>
          </View>

          <View style={styles.divider} />

          {/* Product Details Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin chi tiết</Text>
            
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Ionicons name="time-outline" size={20} color={COLORS.PRIMARY} />
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailLabel}>Thời gian chuẩn bị</Text>
                  <Text style={styles.detailValue}>15-20 phút</Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <Ionicons name="flame-outline" size={20} color={COLORS.PRIMARY} />
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailLabel}>Calories</Text>
                  <Text style={styles.detailValue}>850 kcal</Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <Ionicons name="location-outline" size={20} color={COLORS.PRIMARY} />
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailLabel}>Xuất xứ</Text>
                  <Text style={styles.detailValue}>Việt Nam</Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <Ionicons name="calendar-outline" size={20} color={COLORS.PRIMARY} />
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailLabel}>Hạn sử dụng</Text>
                  <Text style={styles.detailValue}>1 ngày</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mô tả</Text>
            <Text style={styles.description}>
              {product.description || "Pizza phô mai mozzarella, sốt cà chua, húng quế tươi"}
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

          {/* Related Products Carousel */}
          {relatedProducts.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Món tương tự</Text>
                <TouchableOpacity>
                  <Text style={{color: COLORS.PRIMARY, fontSize: 13, fontWeight: "600"}}>Xem tất cả</Text>
                </TouchableOpacity>
              </View>

              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={relatedProducts}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{paddingRight: 20}}
                renderItem={({item}) => (
                  <TouchableOpacity style={styles.relatedProductCard}>
                    <Image source={{uri: item.image}} style={styles.relatedProductImage} />
                    <View style={styles.relatedProductInfo}>
                      <Text style={styles.relatedProductName} numberOfLines={2}>{item.name}</Text>
                      <View style={styles.relatedProductRating}>
                        <Ionicons name="star" size={12} color="#FFA500" />
                        <Text style={styles.relatedProductRatingText}>{item.rating}</Text>
                      </View>
                      <Text style={styles.relatedProductPrice}>{formatCurrency(item.price)}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}

          <View style={styles.divider} />

          {/* Reviews Section - Enhanced */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Đánh giá ({reviews.length})</Text>
              <TouchableOpacity onPress={() => setShowReviewModal(true)}>
                <Text style={{color: COLORS.PRIMARY, fontWeight: "600", fontSize: 13}}>Viết đánh giá</Text>
              </TouchableOpacity>
            </View>

            {reviews.length > 0 && (
              <>
                {/* Rating Breakdown */}
                <View style={styles.ratingBreakdown}>
                  {ratingBreakdown.map((item) => (
                    <TouchableOpacity
                      key={item.star}
                      style={styles.ratingBreakdownRow}
                      onPress={() => setSelectedRatingFilter(selectedRatingFilter === item.star ? null : item.star)}
                    >
                      <Text style={styles.ratingBreakdownStar}>{item.star}⭐</Text>
                      <View style={styles.ratingBreakdownBarContainer}>
                        <View style={[styles.ratingBreakdownBar, {width: `${item.percentage}%`}]} />
                      </View>
                      <Text style={styles.ratingBreakdownCount}>({item.count})</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Review Filters */}
                <View style={styles.reviewFilters}>
                  <TouchableOpacity
                    style={[styles.filterChip, reviewSort === "helpful" && styles.filterChipActive]}
                    onPress={() => setReviewSort("helpful")}
                  >
                    <Text style={[styles.filterChipText, reviewSort === "helpful" && styles.filterChipTextActive]}>
                      Hữu ích nhất
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.filterChip, reviewSort === "latest" && styles.filterChipActive]}
                    onPress={() => setReviewSort("latest")}
                  >
                    <Text style={[styles.filterChipText, reviewSort === "latest" && styles.filterChipTextActive]}>
                      Mới nhất
                    </Text>
                  </TouchableOpacity>

                  {selectedRatingFilter && (
                    <TouchableOpacity
                      style={[styles.filterChip, styles.filterChipActive]}
                      onPress={() => setSelectedRatingFilter(null)}
                    >
                      <Text style={styles.filterChipTextActive}>{selectedRatingFilter}⭐</Text>
                      <Ionicons name="close-circle" size={16} color={COLORS.WHITE} style={{marginLeft: 4}} />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Reviews List */}
                {filteredReviews.length === 0 ? (
                  <Text style={{color: COLORS.GRAY, fontStyle: "italic", marginTop: 8}}>
                    Không có đánh giá nào.
                  </Text>
                ) : (
                  filteredReviews.map((review) => <ReviewItem key={review.id} review={review} />)
                )}
              </>
            )}

            {reviews.length === 0 && (
              <Text style={{color: COLORS.GRAY, fontStyle: "italic", marginTop: 8}}>Chưa có đánh giá nào.</Text>
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
          title={isLoading ? "Đang thêm..." : `Thêm • ${formatCurrency(finalPrice * quantity)}`}
          onPress={handleAddToCart}
          containerStyle={{flex: 1}}
          disabled={!product.available || isLoading}
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
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  floatingHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: COLORS.WHITE,
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  floatingHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.LIGHT_GRAY,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.DARK,
    textAlign: "center",
    marginHorizontal: 12,
  },
  heroImage: {
    width: "100%",
    height: HEADER_HEIGHT,
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 16,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  topOverlayButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  overlayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    backdropFilter: "blur(10px)",
  },
  ratingTag: {
    position: "absolute",
    bottom: 16,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  ratingTagText: {
    color: COLORS.WHITE,
    fontWeight: "bold",
    fontSize: 13,
  },
  discountBadgeTopRight: {
    position: "absolute",
    bottom: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.ERROR,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  discountTextTopRight: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: "bold",
  },
  hotBadge: {
    position: "absolute",
    top: Platform.OS === "ios" ? 100 : 70,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9E6",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
    borderWidth: 1,
    borderColor: "#FFE8A3",
  },
  hotBadgeText: {
    color: "#FF6B35",
    fontSize: 12,
    fontWeight: "bold",
  },
  contentContainer: {
    backgroundColor: COLORS.WHITE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    paddingHorizontal: 20,
    paddingTop: 24,
    minHeight: 500,
  },
  headerInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  productName: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.DARK,
    lineHeight: 32,
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.GRAY,
  },
  categoryText: {
    fontSize: 14,
    color: COLORS.GRAY,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 16,
    gap: 10,
  },
  priceColumn: {
    flexDirection: "column",
    gap: 8,
  },
  priceWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  finalPrice: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.PRIMARY,
  },
  originalPrice: {
    fontSize: 16,
    color: COLORS.GRAY,
    textDecorationLine: "line-through",
  },
  discountBadge: {
    backgroundColor: "#FFE8E8",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  discountBadgeText: {
    color: COLORS.ERROR,
    fontSize: 12,
    fontWeight: "700",
  },
  savingContainerEnhanced: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 8,
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#C8E6C9",
  },
  savingTextEnhanced: {
    fontSize: 14,
    color: "#00B14F",
    fontWeight: "700",
  },
  soldContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 6,
  },
  soldText: {
    fontSize: 14,
    color: COLORS.DARK_GRAY,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginVertical: 24,
  },
  section: {
    marginBottom: 20,
  },