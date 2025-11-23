import React, {useState, useEffect, useCallback} from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  Image,
  Dimensions,
  Modal,
  Platform,
  StatusBar,
} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {useNearbyRestaurants, useRestaurantStore, useRestaurantFilters} from "@stores/restaurantStore";
import {useGeolocation} from "@hooks/useGeolocation";
import {useNotifications} from "@stores/notificationStore"; // Import store thông báo
import {CategoryService, Category} from "@services/category.service"; // Import service danh mục
import Button from "@/src/components/common/Button";
import Input from "@/src/components/common/Input/Input"; // Giả sử Input có prop onChangeText và value
import EmptyState from "@/src/components/common/EmptyState/EmptyState";
import {formatCurrency} from "@utils/formatters";
import {COLORS} from "@/src/styles/colors";
import SearchBar from "@/src/components/common/SearchBar";
import {ROUTE_NAMES} from "@/src/navigation";

const {width, height} = Dimensions.get("window");

const HomeScreen = ({navigation}: any) => {
  // --- Hooks & Stores ---
  const {location, requestLocation} = useGeolocation();
  const nearbyStore = useNearbyRestaurants();
  const allStore = useRestaurantStore();
  const {
    filterByCategory,
    filterByRating,
    filterByOpen,
    filterByPriceRange,
    clearAllFilters,
    filters: activeFilters, // Giả sử store trả về filters hiện tại
  } = useRestaurantFilters();

  const {unreadCount} = useNotifications(); // Lấy số lượng thông báo chưa đọc

  // --- Local State ---
  const [viewMode, setViewMode] = useState<"nearby" | "all" | "toprated">("nearby");
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Filter Modal State
  const [tempPriceMin, setTempPriceMin] = useState("");
  const [tempPriceMax, setTempPriceMax] = useState("");
  const [filterOpenNow, setFilterOpenNow] = useState(false);
  const [filterRating, setFilterRating] = useState<number | null>(null);

  const [banners] = useState([
    {id: 1, title: "Giảm 50%", subtitle: "Đơn hàng đầu tiên", color: "#FF6B6B", icon: "gift"},
    {id: 2, title: "FREESHIP", subtitle: "Đơn từ 100k", color: "#4ECDC4", icon: "bicycle"},
    {id: 3, title: "Tích Điểm", subtitle: "Mọi đơn hàng", color: "#FFB800", icon: "star"},
  ]);

  const store = viewMode === "nearby" ? nearbyStore : allStore;

  // --- Effects ---

  // 1. Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await CategoryService.getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // 2. Fetch Restaurants based on ViewMode
  useEffect(() => {
    handleFetchData();
  }, [location, viewMode]);

  const handleFetchData = () => {
    if (viewMode === "nearby" && location) {
      nearbyStore.fetchNearby(location.latitude, location.longitude, 5);
    } else if (viewMode === "all") {
      allStore.fetchAll({page: 1, limit: 10});
    } else if (viewMode === "toprated") {
      allStore.fetchAll({rating_gte: 4.5, page: 1, limit: 10, sort: "rating", order: "desc"});
    }
  };

  // --- Handlers ---

  const handleRestaurantPress = (restaurantId: number) => {
    navigation.navigate(ROUTE_NAMES.HOME.RESTAURANT_DETAIL, {restaurantId});
  };

  const handleViewModeChange = (mode: "nearby" | "all" | "toprated") => {
    setViewMode(mode);
    setSearchQuery("");
    setSelectedCategory(null);
    clearAllFilters();
  };

  const handleCategorySelect = (categoryId: number) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(null);
      clearAllFilters();
      // Reset về viewMode hiện tại
      handleFetchData();
    } else {
      setSelectedCategory(categoryId);
      filterByCategory(categoryId);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      store.search(query);
    } else if (query.length === 0) {
      // Khi xóa search, fetch lại dữ liệu gốc
      handleFetchData();
    }
  };

  const handleRefresh = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    clearAllFilters();
    handleFetchData();
    // Refresh categories too
    CategoryService.getCategories().then(setCategories);
  };

  // --- Filter Modal Handlers ---
  const applyAdvancedFilters = () => {
    // 1. Price Range
    const min = parseInt(tempPriceMin) || 0;
    const max = parseInt(tempPriceMax) || 10000000;
    if (min > 0 || max < 10000000) {
      filterByPriceRange(min, max);
    }

    // 2. Open Now
    if (filterOpenNow) {
      filterByOpen(true);
    }

    // 3. Rating
    if (filterRating) {
      filterByRating(filterRating);
    }

    setShowFilters(false);
  };

  const resetAdvancedFilters = () => {
    setTempPriceMin("");
    setTempPriceMax("");
    setFilterOpenNow(false);
    setFilterRating(null);
    clearAllFilters();
    setShowFilters(false);
    handleFetchData();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng ☀️";
    if (hour < 18) return "Chào buổi chiều 🌤️";
    return "Chào buổi tối 🌙";
  };

  // --- Render Functions ---

  const renderFilterModal = () => (
    <Modal visible={showFilters} animationType="slide" transparent={true} onRequestClose={() => setShowFilters(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Bộ Lọc Tìm Kiếm</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={24} color={COLORS.GRAY} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Trạng thái */}
            <Text style={styles.filterSectionTitle}>Trạng thái</Text>
            <TouchableOpacity
              style={[styles.filterOptionRow, filterOpenNow && styles.filterOptionRowActive]}
              onPress={() => setFilterOpenNow(!filterOpenNow)}
            >
              <Text style={[styles.filterOptionText, filterOpenNow && styles.filterOptionTextActive]}>Đang mở cửa</Text>
              {filterOpenNow && <Ionicons name="checkmark" size={20} color={COLORS.PRIMARY} />}
            </TouchableOpacity>

            {/* Đánh giá */}
            <Text style={styles.filterSectionTitle}>Đánh giá tối thiểu</Text>
            <View style={styles.ratingFilterContainer}>
              {[3, 4, 4.5, 5].map((rate) => (
                <TouchableOpacity
                  key={rate}
                  style={[styles.ratingChip, filterRating === rate && styles.ratingChipActive]}
                  onPress={() => setFilterRating(filterRating === rate ? null : rate)}
                >
                  <Ionicons name="star" size={14} color={filterRating === rate ? COLORS.WHITE : "#FFB800"} />
                  <Text style={[styles.ratingChipText, filterRating === rate && styles.ratingChipTextActive]}>
                    {rate}+
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Khoảng giá */}
            <Text style={styles.filterSectionTitle}>Khoảng giá (VND)</Text>
            <View style={styles.priceInputsContainer}>
              <View style={styles.priceInputWrapper}>
                <Input
                  placeholder="Thấp nhất"
                  keyboardType="numeric"
                  value={tempPriceMin}
                  onChangeText={setTempPriceMin}
                  containerStyle={{marginBottom: 0}}
                />
              </View>
              <Text style={styles.priceSeparator}>-</Text>
              <View style={styles.priceInputWrapper}>
                <Input
                  placeholder="Cao nhất"
                  keyboardType="numeric"
                  value={tempPriceMax}
                  onChangeText={setTempPriceMax}
                  containerStyle={{marginBottom: 0}}
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button
              title="Thiết lập lại"
              variant="outline"
              containerStyle={{flex: 1, marginRight: 8}}
              onPress={resetAdvancedFilters}
            />
            <Button title="Áp dụng" containerStyle={{flex: 1, marginLeft: 8}} onPress={applyAdvancedFilters} />
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Greeting & Notifications */}
      <View style={styles.greetingSection}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.greetingSubtitle}>Hôm nay bạn muốn ăn gì?</Text>
        </View>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => navigation.navigate("Notifications")} // Đảm bảo route này tồn tại trong Navigator
        >
          <Ionicons name="notifications-outline" size={24} color={COLORS.PRIMARY} />
          {unreadCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>{unreadCount > 99 ? "99+" : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Location */}
      <TouchableOpacity style={styles.locationSection} onPress={requestLocation} activeOpacity={0.7}>
        <View style={styles.locationIconBg}>
          <Ionicons name="location" size={18} color={COLORS.PRIMARY} />
        </View>
        <View style={styles.locationTextContainer}>
          <Text style={styles.locationLabel}>Giao đến</Text>
          <Text style={styles.locationAddress} numberOfLines={1}>
            {location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : "Đang xác định vị trí..."}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={16} color={COLORS.GRAY} />
      </TouchableOpacity>

      {/* Search & Filter */}
      <View style={styles.searchSection}>
        <View style={{flex: 1}}>
          <SearchBar
            value={searchQuery}
            onChangeText={handleSearch}
            onClear={() => handleSearch("")}
            placeholder="Tìm món ăn, nhà hàng..."
          />
        </View>
        <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(true)}>
          <Ionicons name="options" size={22} color={COLORS.WHITE} />
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <View style={styles.categoriesSection}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Danh Mục</Text>
          <TouchableOpacity
            onPress={() => {
              /* Navigate to All Categories if needed */
            }}
          >
            <Text style={styles.seeAllText}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>

        {isLoadingCategories ? (
          <ActivityIndicator size="small" color={COLORS.PRIMARY} style={{padding: 20}} />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryItem, selectedCategory === cat.id && styles.categoryItemActive]}
                onPress={() => handleCategorySelect(cat.id)}
              >
                <View
                  style={[
                    styles.categoryIconContainer,
                    selectedCategory === cat.id && styles.categoryIconContainerActive,
                  ]}
                >
                  {/* Nếu có image url thì dùng Image, nếu không dùng icon/text giả lập */}
                  {cat.image ? (
                    <Image source={{uri: cat.image}} style={styles.categoryImage} />
                  ) : (
                    <Text style={{fontSize: 24}}>{cat.icon || "🍽️"}</Text>
                  )}
                </View>
                <Text style={[styles.categoryName, selectedCategory === cat.id && styles.categoryNameActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Banners */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.bannersContainer}
        snapToInterval={width - 40 + 12} // width + gap
        decelerationRate="fast"
      >
        {banners.map((banner) => (
          <TouchableOpacity
            key={banner.id}
            style={[styles.bannerCard, {backgroundColor: banner.color}]}
            activeOpacity={0.9}
            onPress={() => navigation.navigate("Promotions")} // Giả sử có màn hình Promotions
          >
            <View style={styles.bannerContent}>
              <View style={styles.bannerIconBg}>
                <Ionicons name={banner.icon as any} size={24} color={banner.color} />
              </View>
              <View>
                <Text style={styles.bannerTitle}>{banner.title}</Text>
                <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>
              </View>
            </View>
            <View style={styles.bannerArrow}>
              <Ionicons name="arrow-forward" size={20} color={banner.color} />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* View Mode Tabs */}
      <View style={styles.tabContainer}>
        {[
          {mode: "nearby" as const, label: "Gần tôi", icon: "location"},
          {mode: "all" as const, label: "Phổ biến", icon: "restaurant"},
          {mode: "toprated" as const, label: "Đánh giá cao", icon: "star"},
        ].map((btn) => (
          <TouchableOpacity
            key={btn.mode}
            style={[styles.tabButton, viewMode === btn.mode && styles.tabButtonActive]}
            onPress={() => handleViewModeChange(btn.mode)}
          >
            <Ionicons name={btn.icon as any} size={16} color={viewMode === btn.mode ? COLORS.WHITE : COLORS.GRAY} />
            <Text style={[styles.tabText, viewMode === btn.mode && styles.tabTextActive]}>{btn.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stats Info */}
      {store.items.length > 0 && (
        <Text style={styles.resultCountText}>Tìm thấy {store.items.length} nhà hàng phù hợp</Text>
      )}
    </View>
  );

  // Render Restaurant Item Code... (Giữ nguyên logic nhưng tinh chỉnh style)
  const renderRestaurantItem = (restaurant: any) => (
    <TouchableOpacity
      style={styles.restaurantCardWrapper}
      onPress={() => handleRestaurantPress(restaurant.id)}
      activeOpacity={0.9}
    >
      <View style={styles.restaurantCard}>
        <View style={styles.restaurantImageContainer}>
          {restaurant.image ? (
            <Image source={{uri: restaurant.image}} style={styles.restaurantImage} />
          ) : (
            <View style={[styles.restaurantImage, styles.placeholderImage]}>
              <Ionicons name="image-outline" size={40} color={COLORS.GRAY} />
            </View>
          )}

          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color={COLORS.WHITE} />
            <Text style={styles.ratingText}>{restaurant.rating?.toFixed(1) || "New"}</Text>
          </View>

          {!restaurant.isOpen && (
            <View style={styles.closedOverlay}>
              <Text style={styles.closedText}>ĐÃ ĐÓNG CỬA</Text>
            </View>
          )}
        </View>

        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName} numberOfLines={1}>
            {restaurant.name}
          </Text>
          <Text style={styles.restaurantAddress} numberOfLines={1}>
            {restaurant.address}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={COLORS.PRIMARY} />
              <Text style={styles.metaText}>{restaurant.deliveryTime || "20-30"} phút</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={14} color={COLORS.INFO} />
              <Text style={styles.metaText}>{restaurant.distance ? `${restaurant.distance.toFixed(1)} km` : "?"}</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Ionicons name="pricetag-outline" size={14} color={COLORS.WARNING} />
              <Text style={styles.metaText}>{formatCurrency(restaurant.deliveryFee || 15000)}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // --- Main Render ---
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.WHITE} />
      {renderFilterModal()}

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={store.isRefreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.PRIMARY]}
            tintColor={COLORS.PRIMARY}
          />
        }
        contentContainerStyle={{paddingBottom: 20}}
        onMomentumScrollEnd={() => {
          if (store.hasMore && !store.isLoadingMore) {
            store.fetchMore();
          }
        }}
      >
        {renderHeader()}

        <View style={styles.listContainer}>
          {store.isLoading && store.items.length === 0 ? (
            <View style={styles.centerState}>
              <ActivityIndicator size="large" color={COLORS.PRIMARY} />
              <Text style={styles.loadingText}>Đang tìm nhà hàng ngon...</Text>
            </View>
          ) : store.items.length === 0 ? (
            <EmptyState
              icon="search"
              title="Không tìm thấy kết quả"
              subtitle="Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
            />
          ) : (
            <View style={styles.restaurantGrid}>
              {store.items.map((restaurant) => (
                <View key={restaurant.id}>{renderRestaurantItem(restaurant)}</View>
              ))}
            </View>
          )}

          {store.isLoadingMore && (
            <View style={styles.loadMoreContainer}>
              <ActivityIndicator size="small" color={COLORS.PRIMARY} />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 10 : 0,
    paddingBottom: 10,
    backgroundColor: COLORS.WHITE,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 16,
  },
  greetingSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  greeting: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.DARK,
  },
  greetingSubtitle: {
    fontSize: 13,
    color: COLORS.GRAY,
    marginTop: 2,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FFF0F0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFE5E5",
  },
  notificationBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: COLORS.ERROR,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.WHITE,
  },
  badgeText: {
    color: COLORS.WHITE,
    fontSize: 10,
    fontWeight: "bold",
  },
  locationSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  locationIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#FFF0F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: COLORS.GRAY,
  },
  locationAddress: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.DARK,
  },
  searchSection: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  filterButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.PRIMARY,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.DARK,
  },
  seeAllText: {
    fontSize: 13,
    color: COLORS.PRIMARY,
    fontWeight: "600",
  },
  categoriesSection: {
    marginBottom: 12,
  },
  categoriesContainer: {
    gap: 8,
  },
  categoryItem: {
    alignItems: "center",
    width: 70,
  },
  categoryItemActive: {
    transform: [{scale: 1.05}],
  },
  categoryIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
    overflow: "hidden",
  },
  categoryIconContainerActive: {
    backgroundColor: COLORS.PRIMARY,
    borderWidth: 2,
    borderColor: "#FFD1D1",
  },
  categoryImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  categoryName: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.DARK_GRAY,
    textAlign: "center",
  },
  categoryNameActive: {
    fontWeight: "700",
    color: COLORS.PRIMARY,
  },
  bannersContainer: {
    gap: 12,
    paddingRight: 20,
    marginBottom: 12,
  },
  bannerCard: {
    width: width - 40,
    borderRadius: 12,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 76,
  },
  bannerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  bannerIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.WHITE,
    justifyContent: "center",
    alignItems: "center",
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.WHITE,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
    marginTop: 2,
  },
  bannerArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.WHITE,
    justifyContent: "center",
    alignItems: "center",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    padding: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  tabButtonActive: {
    backgroundColor: COLORS.PRIMARY,
    shadowColor: COLORS.PRIMARY,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.GRAY,
  },
  tabTextActive: {
    color: COLORS.WHITE,
  },
  resultCountText: {
    fontSize: 12,
    color: COLORS.GRAY,
    marginBottom: 4,
    textAlign: "center",
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  restaurantGrid: {
    gap: 16,
  },
  restaurantCardWrapper: {
    marginBottom: 4,
  },
  restaurantCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  restaurantImageContainer: {
    height: 180,
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  restaurantImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholderImage: {
    justifyContent: "center",
    alignItems: "center",
  },
  ratingBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 4,
  },
  ratingText: {
    color: COLORS.WHITE,
    fontWeight: "700",
    fontSize: 12,
  },
  closedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  closedText: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.DARK,
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    overflow: "hidden",
  },
  restaurantInfo: {
    padding: 16,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.DARK,
    marginBottom: 4,
  },
  restaurantAddress: {
    fontSize: 13,
    color: COLORS.GRAY,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.DARK_GRAY,
  },
  metaDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.BORDER,
    marginHorizontal: 8,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.WHITE,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: "70%",
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.DARK,
  },
  modalBody: {
    padding: 20,
  },
  modalFooter: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.LIGHT_GRAY,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.DARK,
    marginTop: 16,
    marginBottom: 12,
  },
  filterOptionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
  },
  filterOptionRowActive: {
    backgroundColor: "#F0FDF4", // Light green bg when active
    paddingHorizontal: 12,
    borderRadius: 8,
    borderBottomWidth: 0,
  },
  filterOptionText: {
    fontSize: 15,
    color: COLORS.DARK_GRAY,
  },
  filterOptionTextActive: {
    color: COLORS.PRIMARY,
    fontWeight: "600",
  },
  ratingFilterContainer: {
    flexDirection: "row",
    gap: 12,
  },
  ratingChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    gap: 4,
  },
  ratingChipActive: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
  ratingChipText: {
    fontWeight: "600",
    color: COLORS.DARK_GRAY,
  },
  ratingChipTextActive: {
    color: COLORS.WHITE,
  },
  priceInputsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  priceInputWrapper: {
    flex: 1,
  },
  priceSeparator: {
    fontSize: 20,
    color: COLORS.GRAY,
  },
  centerState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.GRAY,
    fontSize: 14,
  },
  loadMoreContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
});

export default HomeScreen;
