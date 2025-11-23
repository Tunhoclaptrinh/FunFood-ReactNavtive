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
  FlatList,
} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {ProductService} from "@services/product.service";
import {ReviewService} from "@services/review.service";
import {useCart} from "@hooks/useCart";
import Button from "@/src/components/common/Button";
import EmptyState from "@/src/components/common/EmptyState/EmptyState";
import {formatCurrency} from "@utils/formatters";
import {COLORS} from "@/src/styles/colors";

interface RouteParams {
  productId: number;
}

interface Review {
  id: number;
  userId: number;
  rating: number;
  comment: string;
  createdAt: string;
}

const ProductDetailScreen = ({route, navigation}: any) => {
  const {productId} = route.params as RouteParams;
  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const {addItem} = useCart();

  useEffect(() => {
    loadProductData();
  }, [productId]);

  const loadProductData = async () => {
    try {
      setLoading(true);
      const res = await ProductService.getById(productId);
      setProduct(res);

      // Load reviews for this product
      try {
        const reviewsRes = await ReviewService.getRestaurantReviews(res.restaurantId, 1, 10);
        setReviews((reviewsRes as any)?.data || []);
      } catch (error) {
        console.error("Error loading reviews:", error);
      }
    } catch (error) {
      console.error("Error loading product:", error);
      Alert.alert("Error", "Failed to load product details");
    } finally {
      setLoading(false);
      setReviewsLoading(false);
    }
  };

  const handleIncreaseQty = () => {
    setQuantity(Math.min(quantity + 1, 20));
  };

  const handleDecreaseQty = () => {
    setQuantity(Math.max(quantity - 1, 1));
  };

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      Alert.alert("Added to Cart", `${product.name} x${quantity} added to your cart`, [
        {
          text: "Continue Shopping",
          onPress: () => navigation.goBack(),
        },
        {
          text: "Go to Cart",
          onPress: () => {
            navigation.navigate("Cart");
          },
          style: "default",
        },
      ]);
      setQuantity(1);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={[styles.container, styles.centered]}>
        <EmptyState icon="alert-outline" title="Product not found" subtitle="Please go back and try again" />
      </View>
    );
  }

  const finalPrice = product.price * (1 - (product.discount || 0) / 100);
  const avgRating =
    reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          {product.image ? (
            <Image source={{uri: product.image}} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={[styles.image, styles.placeholderImage]}>
              <Ionicons name="image-outline" size={60} color={COLORS.LIGHT_GRAY} />
            </View>
          )}

          {product.discount ? (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{product.discount}%</Text>
              <Text style={styles.discountLabel}>OFF</Text>
            </View>
          ) : null}

          {!product.available && (
            <View style={styles.unavailableBadge}>
              <Text style={styles.unavailableText}>Unavailable</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.infoSection}>
          <View style={styles.headerRow}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{product.name}</Text>
              {product.rating && (
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={16} color="#FFB800" />
                  <Text style={styles.rating}>{product.rating.toFixed(1)}</Text>
                  <Text style={styles.reviewCount}>({product.totalReviews || 0} reviews)</Text>
                </View>
              )}
            </View>
          </View>

          {/* Price */}
          <View style={styles.priceSection}>
            {product.discount ? (
              <>
                <Text style={styles.originalPrice}>{formatCurrency(product.price)}</Text>
                <Text style={styles.finalPrice}>{formatCurrency(finalPrice)}</Text>
              </>
            ) : (
              <Text style={styles.finalPrice}>{formatCurrency(product.price)}</Text>
            )}
          </View>

          {/* Description */}
          {product.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.descriptionTitle}>Description</Text>
              <Text style={styles.description}>{product.description}</Text>
            </View>
          )}

          {/* Status */}
          <View style={styles.statusSection}>
            <Text
              style={[
                styles.statusText,
                {
                  color: product.available ? COLORS.SUCCESS : COLORS.ERROR,
                },
              ]}
            >
              {product.available ? "✓ In Stock" : "✗ Out of Stock"}
            </Text>
          </View>
        </View>

        {/* Quantity Selector */}
        <View style={styles.quantitySection}>
          <Text style={styles.quantityLabel}>Quantity</Text>
          <View style={styles.quantityControl}>
            <Button title="-" onPress={handleDecreaseQty} variant="outline" size="small" style={styles.qtyButton} />
            <Text style={styles.quantityDisplay}>{quantity}</Text>
            <Button title="+" onPress={handleIncreaseQty} variant="outline" size="small" style={styles.qtyButton} />
          </View>
          <Text style={styles.subtotal}>Subtotal: {formatCurrency(finalPrice * quantity)}</Text>
        </View>

        {/* Reviews Section */}
        <View style={styles.reviewsSection}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.reviewsTitle}>Customer Reviews</Text>
            <Text style={styles.reviewCount}>
              {reviews.length} reviews • {avgRating} avg
            </Text>
          </View>

          {reviews.length > 0 ? (
            <FlatList
              data={reviews.slice(0, 5)}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({item}) => (
                <View style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.ratingStars}>
                      {Array.from({length: 5}).map((_, i) => (
                        <Ionicons key={i} name={i < item.rating ? "star" : "star-outline"} size={14} color="#FFB800" />
                      ))}
                    </View>
                    <Text style={styles.reviewDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                  </View>
                  <Text style={styles.reviewComment}>{item.comment}</Text>
                </View>
              )}
              scrollEnabled={false}
            />
          ) : (
            <Text style={styles.noReviews}>No reviews yet</Text>
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Add to Cart Button */}
      <View style={styles.footer}>
        <Button
          title={`Add to Cart - ${formatCurrency(finalPrice * quantity)}`}
          onPress={handleAddToCart}
          disabled={!product.available}
          style={styles.addButton}
        />
      </View>
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
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 280,
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
  discountBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  discountText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: "bold",
  },
  discountLabel: {
    color: COLORS.WHITE,
    fontSize: 10,
    fontWeight: "600",
  },
  unavailableBadge: {
    position: "absolute",
    bottom: 12,
    left: 12,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  unavailableText: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: "600",
  },
  infoSection: {
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.DARK,
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.DARK,
  },
  reviewCount: {
    fontSize: 12,
    color: COLORS.GRAY,
  },
  priceSection: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
  },
  originalPrice: {
    fontSize: 14,
    color: COLORS.GRAY,
    textDecorationLine: "line-through",
    marginBottom: 4,
  },
  finalPrice: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.PRIMARY,
  },
  descriptionSection: {
    marginBottom: 16,
  },
  descriptionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.DARK,
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    color: COLORS.GRAY,
    lineHeight: 20,
  },
  statusSection: {
    marginBottom: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  quantitySection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.LIGHT_GRAY,
    marginVertical: 8,
  },
  quantityLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.DARK,
    marginBottom: 12,
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  qtyButton: {
    flex: 0.2,
    paddingHorizontal: 0,
  },
  quantityDisplay: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.DARK,
    flex: 0.6,
    textAlign: "center",
  },
  subtotal: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.PRIMARY,
    textAlign: "right",
  },
  reviewsSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  reviewsHeader: {
    marginBottom: 12,
  },
  reviewsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.DARK,
    marginBottom: 4,
  },
  reviewCard: {
    backgroundColor: COLORS.LIGHT_GRAY,
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  ratingStars: {
    flexDirection: "row",
    gap: 2,
  },
  reviewDate: {
    fontSize: 11,
    color: COLORS.GRAY,
  },
  reviewComment: {
    fontSize: 12,
    color: COLORS.DARK,
    lineHeight: 18,
  },
  noReviews: {
    fontSize: 13,
    color: COLORS.GRAY,
    textAlign: "center",
    paddingVertical: 12,
  },
  bottomPadding: {
    height: 120,
  },
  footer: {
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
  addButton: {
    width: "100%",
  },
});

export default ProductDetailScreen;
