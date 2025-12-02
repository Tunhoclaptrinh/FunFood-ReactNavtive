import React, {useState, useCallback} from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Text,
} from "react-native";
import SafeAreaView from "@/src/components/common/SafeAreaView";
import {Ionicons} from "@expo/vector-icons";
import {useFocusEffect} from "@react-navigation/native";
import {FavoriteService} from "@services/favorite.service";
import EmptyState from "@/src/components/common/EmptyState/EmptyState";
import {formatCurrency, getImageUrl} from "@utils/formatters"; // Thêm getImageUrl
import {COLORS} from "@/src/styles/colors";
import {ROUTE_NAMES} from "@/src/navigation";
import Card from "@/src/components/common/Card"; // Đảm bảo đã import Card

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
    Alert.alert("Bỏ yêu thích", `Bạn muốn bỏ "${name}" khỏi danh sách?`, [
      {text: "Hủy", style: "cancel"},
      {
        text: "Đồng ý",
        style: "destructive",
        onPress: async () => {
          try {
            await FavoriteService.toggleFavorite(type, id);
            if (type === "restaurant") {
              setRestaurants(restaurants.filter((item) => item.referenceId !== id));
            } else {
              setProducts(products.filter((item) => item.referenceId !== id));
            }
          } catch (error: any) {
            Alert.alert("Lỗi", "Không thể thực hiện thao tác này");
          }
        },
      },
    ]);
  };

  const renderItem = ({item}: {item: FavoriteItem}) => {
    const isRestaurant = item.type === "restaurant";

    // --- SỬA Ở ĐÂY ---
    // Kiểm tra xem dữ liệu nằm trong 'item.item', 'item.restaurant' hay 'item.product'
    // Dữ liệu log của bạn cho thấy nó nằm trong 'item.item' (do API trả về field tên là item)
    const dataRaw = (item as any).item || (isRestaurant ? item.restaurant : item.product);
    const data = dataRaw || {};
    // ----------------

    // Dữ liệu hiển thị
    const title = data.name || (isRestaurant ? "Nhà hàng không tồn tại" : "Sản phẩm không tồn tại");
    const image = getImageUrl(data.image);
    const rating = data.rating;

    // Subtitle
    const subtitle = isRestaurant
      ? data.address || "Chưa cập nhật địa chỉ"
      : `${formatCurrency(data.price || 0)} ${data.discount > 0 ? `(-${data.discount}%)` : ""}`;

    // Badge
    const badgeText = isRestaurant ? (data.isOpen ? "Đang mở" : "Đóng cửa") : data.available ? "Còn hàng" : "Hết hàng";

    const badgeColor = isRestaurant
      ? data.isOpen
        ? COLORS.SUCCESS
        : COLORS.ERROR
      : data.available
      ? COLORS.SUCCESS
      : COLORS.GRAY;

    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() =>
          isRestaurant
            ? navigation.navigate("RestaurantDetail", {restaurantId: item.referenceId})
            : navigation.navigate("ProductDetail", {productId: item.referenceId})
        }
        activeOpacity={0.9}
      >
        <Card
          variant="default"
          image={image}
          imageHeight={180} // Ảnh lớn
          title={title}
          subtitle={subtitle}
          rating={rating}
          badge={badgeText}
          badgeColor={badgeColor}
          footer={
            <TouchableOpacity
              style={styles.heartButton}
              onPress={() => handleRemoveFavorite(item.type, item.referenceId, title)}
            >
              <Ionicons name="heart" size={24} color={COLORS.ERROR} />
            </TouchableOpacity>
          }
        />
      </TouchableOpacity>
    );
  };

  const currentData = activeTab === "restaurant" ? restaurants : products;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
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
        >
          <Ionicons
            name="storefront-outline"
            size={20}
            color={activeTab === "restaurant" ? COLORS.PRIMARY : COLORS.GRAY}
          />
          <Text style={[styles.tabText, activeTab === "restaurant" && styles.tabTextActive]}>Nhà hàng</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "product" && styles.tabActive]}
          onPress={() => setActiveTab("product")}
        >
          <Ionicons name="fast-food-outline" size={20} color={activeTab === "product" ? COLORS.PRIMARY : COLORS.GRAY} />
          <Text style={[styles.tabText, activeTab === "product" && styles.tabTextActive]}>Món ăn</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {currentData.length === 0 ? (
        <EmptyState
          icon="heart-outline"
          title="Chưa có yêu thích"
          subtitle={`Hãy thả tim cho các ${activeTab === "restaurant" ? "nhà hàng" : "món ăn"} bạn thích nhé!`}
        />
      ) : (
        <FlatList
          data={currentData}
          keyExtractor={(item) => `${item.type}-${item.id}`}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.PRIMARY]} />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: "#F8F9FA"},
  loadingContainer: {flex: 1, justifyContent: "center", alignItems: "center"},
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.WHITE,
    padding: 12,
    gap: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: {width: 0, height: 2},
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: COLORS.LIGHT_GRAY,
    gap: 8,
  },
  tabActive: {backgroundColor: "#FFE5E5", borderWidth: 1, borderColor: COLORS.PRIMARY},
  tabText: {fontWeight: "600", color: COLORS.GRAY},
  tabTextActive: {color: COLORS.PRIMARY},

  listContent: {padding: 16, paddingBottom: 40},
  itemContainer: {marginBottom: 20},

  heartButton: {
    position: "absolute",
    bottom: 80,
    right: 12,
    backgroundColor: COLORS.WHITE,
    padding: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default FavoritesListScreen;
