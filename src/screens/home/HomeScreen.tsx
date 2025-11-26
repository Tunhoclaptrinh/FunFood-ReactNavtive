import React, {useState, useEffect} from "react";
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

// --- Stores & Hooks ---
import {useNearbyRestaurants, useRestaurantStore, useRestaurantFilters} from "@stores/restaurantStore";
import {useGeolocation} from "@hooks/useGeolocation";
import {useNotifications} from "@stores/notificationStore";
import {CategoryService, Category} from "@services/category.service";

// --- Services & Components ---
import {MapService, MapMarker} from "@services/map.service";
import MapView from "@/src/components/common/MapView";
import Button from "@/src/components/common/Button";
import Input from "@/src/components/common/Input/Input"; // Đảm bảo bạn đã import Input
import EmptyState from "@/src/components/common/EmptyState/EmptyState";
import SearchBar from "@/src/components/common/SearchBar";
import {formatCurrency} from "@utils/formatters";
import {COLORS} from "@/src/styles/colors";
import {ROUTE_NAMES} from "@/src/navigation";

const {width} = Dimensions.get("window");

type DataSourceType = "nearby" | "all" | "toprated";
type LayoutModeType = "list" | "map";

const HomeScreen = ({navigation}: any) => {
  // --- Hooks & Stores ---
  const {location, requestLocation} = useGeolocation();
  const nearbyStore = useNearbyRestaurants();
  const allStore = useRestaurantStore();
  const {filterByCategory, filterByRating, filterByOpen, filterByPriceRange, clearAllFilters} = useRestaurantFilters();
  const {unreadCount} = useNotifications();

  // --- State: Data & UI ---
  const [dataSource, setDataSource] = useState<DataSourceType>("nearby");
  const [layoutMode, setLayoutMode] = useState<LayoutModeType>("list");
  const [searchQuery, setSearchQuery] = useState("");

  // --- State: Map Logic ---
  const [mapMarkers, setMapMarkers] = useState<MapMarker[]>([]);
  const [selectedMapRestaurant, setSelectedMapRestaurant] = useState<any>(null);
  const [showMapModal, setShowMapModal] = useState(false);

  // --- State: Filters & Categories ---
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Filter Modal Internal State
  const [tempPriceMin, setTempPriceMin] = useState("");
  const [tempPriceMax, setTempPriceMax] = useState("");
  const [filterOpenNow, setFilterOpenNow] = useState(false);
  const [filterRating, setFilterRating] = useState<number | null>(null);

  // Banners Data
  const [banners] = useState([
    {id: 1, title: "Giảm 50%", subtitle: "Đơn hàng đầu tiên", color: "#FF6B6B", icon: "gift"},
    {id: 2, title: "FREESHIP", subtitle: "Đơn từ 100k", color: "#4ECDC4", icon: "bicycle"},
    {id: 3, title: "Tích Điểm", subtitle: "Mọi đơn hàng", color: "#FFB800", icon: "star"},
  ]);

  const store = dataSource === "nearby" ? nearbyStore : allStore;

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

  // 2. Fetch Data based on Source
  useEffect(() => {
    handleFetchData();
  }, [location, dataSource]);

  // 3. Sync Store Items to Map Markers
  useEffect(() => {
    if (store.items.length > 0) {
      const markers = store.items
        .filter((r) => r.latitude && r.longitude)
        .map((r) => MapService.createRestaurantMarker(r));
      setMapMarkers(markers);
    } else {
      setMapMarkers([]);
    }
  }, [store.items]);

  // --- Handlers ---

  const handleFetchData = () => {
    if (dataSource === "nearby" && location) {
      nearbyStore.fetchNearby(location.latitude, location.longitude, 5);
    } else if (dataSource === "all") {
      allStore.fetchAll({page: 1, limit: 10});
    } else if (dataSource === "toprated") {
      allStore.fetchAll({rating_gte: 4.5, page: 1, limit: 10, sort: "rating", order: "desc"});
    }
  };

  const handleRefresh = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    clearAllFilters();
    handleFetchData();
    CategoryService.getCategories().then(setCategories);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      store.search(query);
    } else if (query.length === 0) {
      handleFetchData();
    }
  };

  const handleRestaurantPress = (restaurantId: number) => {
    setShowMapModal(false);
    navigation.navigate(ROUTE_NAMES.HOME.RESTAURANT_DETAIL, {restaurantId});
  };

  const handleMapMarkerPress = (marker: MapMarker) => {
    const restaurantId = parseInt(marker.id.replace("restaurant-", ""));
    const restaurant = store.items.find((r) => r.id === restaurantId);
    if (restaurant) {
      setSelectedMapRestaurant(restaurant);
      setShowMapModal(true);
    }
  };

  const applyAdvancedFilters = () => {
    const min = parseInt(tempPriceMin) || 0;
    const max = parseInt(tempPriceMax) || 10000000;
    if (min > 0 || max < 10000000) filterByPriceRange(min, max);
    if (filterOpenNow) filterByOpen(true);
    if (filterRating) filterByRating(filterRating);
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

  // --- Renders ---

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Greeting & Notif */}
      <View style={styles.greetingSection}>
        <View>
          <Text style={styles.greeting}>Chào buổi sáng ☀️</Text>
          <Text style={styles.greetingSubtitle}>Hôm nay bạn muốn ăn gì?</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton} onPress={() => navigation.navigate("Notifications")}>
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

      {/* Search, Filter & MAP TOGGLE */}
      <View style={styles.searchSection}>
        <View style={{flex: 1}}>
          <SearchBar
            value={searchQuery}
            onChangeText={handleSearch}
            onClear={() => handleSearch("")}
            placeholder="Tìm món ăn..."
          />
        </View>

        {/* Toggle List/Map */}
        <TouchableOpacity
          style={[styles.iconButton, {backgroundColor: layoutMode === "map" ? COLORS.PRIMARY : "#F3F4F6"}]}
          onPress={() => setLayoutMode(layoutMode === "list" ? "map" : "list")}
        >
          <Ionicons
            name={layoutMode === "list" ? "map" : "list"}
            size={22}
            color={layoutMode === "map" ? COLORS.WHITE : COLORS.GRAY}
          />
        </TouchableOpacity>

        {/* Filter Button */}
        <TouchableOpacity style={[styles.iconButton, styles.filterButton]} onPress={() => setShowFilters(true)}>
          <Ionicons name="options" size={22} color={COLORS.WHITE} />
        </TouchableOpacity>
      </View>

      {/* List Mode Only: Categories & Banners */}
      {layoutMode === "list" && (
        <>
          <View style={styles.categoriesSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
            >
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryItem, selectedCategory === cat.id && styles.categoryItemActive]}
                  onPress={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                >
                  <View
                    style={[
                      styles.categoryIconContainer,
                      selectedCategory === cat.id && styles.categoryIconContainerActive,
                    ]}
                  >
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
          </View>

          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.bannersContainer}
            snapToInterval={width - 40 + 12}
          >
            {banners.map((banner) => (
              <TouchableOpacity key={banner.id} style={[styles.bannerCard, {backgroundColor: banner.color}]}>
                <View style={styles.bannerContent}>
                  <View style={styles.bannerIconBg}>
                    <Ionicons name={banner.icon as any} size={24} color={banner.color} />
                  </View>
                  <View>
                    <Text style={styles.bannerTitle}>{banner.title}</Text>
                    <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {[
          {mode: "nearby" as const, label: "Gần tôi", icon: "location"},
          {mode: "all" as const, label: "Phổ biến", icon: "restaurant"},
          {mode: "toprated" as const, label: "Đánh giá cao", icon: "star"},
        ].map((btn) => (
          <TouchableOpacity
            key={btn.mode}
            style={[styles.tabButton, dataSource === btn.mode && styles.tabButtonActive]}
            onPress={() => {
              setDataSource(btn.mode);
              setSearchQuery("");
            }}
          >
            <Ionicons name={btn.icon as any} size={16} color={dataSource === btn.mode ? COLORS.WHITE : COLORS.GRAY} />
            <Text style={[styles.tabText, dataSource === btn.mode && styles.tabTextActive]}>{btn.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {store.items.length > 0 && (
        <Text style={styles.resultCountText}>
          {store.items.length} kết quả {layoutMode === "map" ? "trên bản đồ" : ""}
        </Text>
      )}
    </View>
  );

  const renderMapView = () => {
    if (!location) {
      return (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Đang tải bản đồ...</Text>
        </View>
      );
    }
    return (
      <MapView markers={mapMarkers} onMarkerPress={handleMapMarkerPress} enableTracking={true} style={styles.map} />
    );
  };

  // --- [SỬA LỖI 1] Logic hiển thị ảnh nhà hàng ---
  const renderRestaurantItem = (restaurant: any) => (
    <TouchableOpacity
      key={restaurant.id}
      style={styles.restaurantCard}
      onPress={() => handleRestaurantPress(restaurant.id)}
      activeOpacity={0.9}
    >
      <View style={styles.restaurantImageContainer}>
        {/* Logic: Nếu có ảnh thì render Image, không thì render Placeholder */}
        {restaurant.image ? (
          <Image source={{uri: restaurant.image}} style={styles.restaurantImage} resizeMode="cover" />
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
            <Text style={styles.closedText}>ĐÃ ĐÓNG</Text>
          </View>
        )}
      </View>

      <View style={styles.restaurantInfo}>
        <Text style={styles.restaurantName} numberOfLines={1}>
          {restaurant.name}
        </Text>
        <Text style={{fontSize: 12, color: COLORS.GRAY, marginBottom: 8}} numberOfLines={1}>
          {restaurant.address}
        </Text>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={COLORS.PRIMARY} />
            <Text style={styles.metaText}>{restaurant.deliveryTime || "20-30"}p</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Ionicons name="pricetag-outline" size={14} color={COLORS.WARNING} />
            <Text style={styles.metaText}>{formatCurrency(restaurant.deliveryFee || 15000)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderListView = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={store.isRefreshing} onRefresh={handleRefresh} colors={[COLORS.PRIMARY]} />
      }
      contentContainerStyle={{paddingBottom: 20, paddingHorizontal: 20}}
    >
      {store.isLoading && store.items.length === 0 ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      ) : store.items.length === 0 ? (
        <EmptyState icon="search" title="Không tìm thấy kết quả" subtitle="Thử thay đổi bộ lọc hoặc vùng tìm kiếm" />
      ) : (
        <View style={styles.restaurantGrid}>{store.items.map((restaurant) => renderRestaurantItem(restaurant))}</View>
      )}
    </ScrollView>
  );

  // --- [SỬA LỖI 2] Giao diện Filter đầy đủ ---
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
            {/* 1. Trạng thái */}
            <Text style={styles.filterSectionTitle}>Trạng thái</Text>
            <TouchableOpacity
              style={[styles.filterOptionRow, filterOpenNow && styles.filterOptionRowActive]}
              onPress={() => setFilterOpenNow(!filterOpenNow)}
            >
              <Text style={[styles.filterOptionText, filterOpenNow && styles.filterOptionTextActive]}>Đang mở cửa</Text>
              {filterOpenNow && <Ionicons name="checkmark" size={20} color={COLORS.PRIMARY} />}
            </TouchableOpacity>

            {/* 2. Đánh giá (Rating Chips) */}
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

            {/* 3. Khoảng giá (Price Inputs) */}
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
            <Button title="Áp dụng" containerStyle={{flex: 1}} onPress={applyAdvancedFilters} />
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderMapPreviewModal = () => {
    if (!selectedMapRestaurant) return null;
    return (
      <Modal visible={showMapModal} transparent animationType="slide" onRequestClose={() => setShowMapModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Thông tin nhanh</Text>
              <TouchableOpacity onPress={() => setShowMapModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.DARK} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              {/* Modal cũng cần hiển thị ảnh nếu có */}
              {selectedMapRestaurant.image && (
                <Image
                  source={{uri: selectedMapRestaurant.image}}
                  style={{width: "100%", height: 120, borderRadius: 8, marginBottom: 12}}
                  resizeMode="cover"
                />
              )}
              <Text style={styles.modalRestaurantName}>{selectedMapRestaurant.name}</Text>
              <Text style={{color: COLORS.GRAY, marginBottom: 10}}>{selectedMapRestaurant.address}</Text>
              <View style={styles.modalMetaRow}>
                <Ionicons name="star" size={16} color="#FFB800" />
                <Text style={{fontWeight: "bold", marginRight: 10, marginLeft: 4}}>
                  {selectedMapRestaurant.rating?.toFixed(1)}
                </Text>
                <Ionicons name="navigate-outline" size={16} color={COLORS.INFO} />
                <Text style={{marginLeft: 4}}>{selectedMapRestaurant.distance?.toFixed(1)} km</Text>
              </View>
            </View>
            <View style={styles.modalFooter}>
              <Button title="Xem chi tiết" onPress={() => handleRestaurantPress(selectedMapRestaurant.id)} />
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.WHITE} />

      {renderHeader()}

      <View style={{flex: 1}}>{layoutMode === "map" ? renderMapView() : renderListView()}</View>

      {renderFilterModal()}
      {renderMapPreviewModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: "#FAFAFA"},
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
    zIndex: 10,
  },
  greetingSection: {flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12},
  greeting: {fontSize: 22, fontWeight: "800", color: COLORS.DARK},
  greetingSubtitle: {fontSize: 13, color: COLORS.GRAY},
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFF0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  notificationBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: COLORS.ERROR,
    paddingHorizontal: 4,
    borderRadius: 10,
  },
  badgeText: {color: "white", fontSize: 10, fontWeight: "bold"},

  locationSection: {flexDirection: "row", alignItems: "center", marginBottom: 12},
  locationIconBg: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#FFF0F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  locationTextContainer: {flex: 1},
  locationLabel: {fontSize: 11, color: COLORS.GRAY},
  locationAddress: {fontSize: 13, fontWeight: "600", color: COLORS.DARK},

  searchSection: {flexDirection: "row", gap: 8, marginBottom: 8},
  iconButton: {width: 50, height: 50, borderRadius: 12, justifyContent: "center", alignItems: "center"},
  filterButton: {backgroundColor: COLORS.PRIMARY, shadowColor: COLORS.PRIMARY, shadowOpacity: 0.3, elevation: 4},

  categoriesSection: {marginBottom: 12},
  categoriesContainer: {gap: 12},
  categoryItem: {alignItems: "center", width: 64},
  categoryIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
    overflow: "hidden",
  },
  categoryIconContainerActive: {backgroundColor: COLORS.PRIMARY, borderWidth: 2, borderColor: "#FFD1D1"},
  categoryImage: {width: "100%", height: "100%", borderRadius: 18},
  categoryName: {fontSize: 11, fontWeight: "500", color: COLORS.DARK_GRAY, textAlign: "center"},
  categoryNameActive: {color: COLORS.PRIMARY, fontWeight: "700"},

  bannersContainer: {gap: 12, marginBottom: 12, paddingRight: 20},
  bannerCard: {
    width: width - 40,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    height: 70,
    alignItems: "center",
  },
  bannerContent: {flexDirection: "row", alignItems: "center", gap: 12},
  bannerIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  bannerTitle: {fontSize: 16, fontWeight: "800", color: "white"},
  bannerSubtitle: {fontSize: 12, color: "rgba(255,255,255,0.9)"},

  tabContainer: {flexDirection: "row", backgroundColor: "#F3F4F6", padding: 4, borderRadius: 8, marginBottom: 4},
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  tabButtonActive: {backgroundColor: COLORS.PRIMARY},
  tabText: {fontSize: 12, fontWeight: "600", color: COLORS.GRAY},
  tabTextActive: {color: COLORS.WHITE},
  resultCountText: {fontSize: 11, color: COLORS.GRAY, textAlign: "center", marginTop: 4},

  // Map & List Styles
  map: {flex: 1},
  restaurantGrid: {gap: 16, marginTop: 10},
  restaurantCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },

  // Image Rendering Styles
  restaurantImageContainer: {height: 160, backgroundColor: COLORS.LIGHT_GRAY, position: "relative"},
  restaurantImage: {width: "100%", height: "100%"},
  placeholderImage: {alignItems: "center", justifyContent: "center"},

  ratingBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  ratingText: {color: "white", fontSize: 11, fontWeight: "bold"},
  closedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  closedText: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.ERROR,
    backgroundColor: "white",
    padding: 8,
    borderRadius: 4,
  },

  restaurantInfo: {padding: 12},
  restaurantName: {fontSize: 16, fontWeight: "700", marginBottom: 4},
  metaRow: {flexDirection: "row", alignItems: "center", gap: 4},
  metaItem: {flexDirection: "row", alignItems: "center", gap: 4},
  metaDivider: {width: 3, height: 3, backgroundColor: COLORS.GRAY, borderRadius: 1.5, marginHorizontal: 6},
  metaText: {fontSize: 12, color: COLORS.GRAY},

  // Modals Common
  modalOverlay: {flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end"},
  modalContent: {
    backgroundColor: COLORS.WHITE,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 30,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderColor: COLORS.LIGHT_GRAY,
  },
  modalTitle: {fontSize: 18, fontWeight: "700"},
  modalBody: {padding: 20},
  modalRestaurantName: {fontSize: 20, fontWeight: "800", marginBottom: 4},
  modalMetaRow: {flexDirection: "row", alignItems: "center"},
  modalFooter: {padding: 20, borderTopWidth: 1, borderColor: COLORS.LIGHT_GRAY, flexDirection: "row"},

  // Filter Specific Styles (Đã thêm lại)
  filterSectionTitle: {fontSize: 16, fontWeight: "700", color: COLORS.DARK, marginTop: 10, marginBottom: 12},
  filterOptionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: COLORS.LIGHT_GRAY,
    alignItems: "center",
  },
  filterOptionRowActive: {backgroundColor: "#F0FDF4", borderBottomWidth: 0, paddingHorizontal: 10, borderRadius: 8},
  filterOptionText: {fontSize: 15, color: COLORS.DARK_GRAY},
  filterOptionTextActive: {color: COLORS.PRIMARY, fontWeight: "600"},

  ratingFilterContainer: {flexDirection: "row", gap: 12},
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
  ratingChipActive: {backgroundColor: COLORS.PRIMARY, borderColor: COLORS.PRIMARY},
  ratingChipText: {fontWeight: "600", color: COLORS.DARK_GRAY},
  ratingChipTextActive: {color: COLORS.WHITE},

  priceInputsContainer: {flexDirection: "row", alignItems: "center", gap: 12},
  priceInputWrapper: {flex: 1},
  priceSeparator: {fontSize: 20, color: COLORS.GRAY},

  centerState: {flex: 1, justifyContent: "center", alignItems: "center"},
  loadingText: {marginTop: 10, color: COLORS.GRAY},
  categoryItemActive: {
    transform: [{scale: 1.05}],
  },
});

export default HomeScreen;
