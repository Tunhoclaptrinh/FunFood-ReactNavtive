import React, {useState, useEffect, useCallback, useRef} from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Dimensions,
  Modal,
  StatusBar,
  Alert,
  FlatList,
  Animated,
} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";

// --- Stores & Hooks ---
import {useNearbyRestaurants, useRestaurantStore, useRestaurantFilters} from "@stores/restaurantStore";
import {useGeolocation} from "@hooks/useGeolocation";
import {useNotifications} from "@stores/notificationStore";
import {CategoryService, Category} from "@services/category.service";
import {PromotionService} from "@services/promotion.service";

// --- Components ---
import {MapService, MapMarker} from "@services/map.service";
import Button from "@/src/components/common/Button";
import Input from "@/src/components/common/Input/Input";
import EmptyState from "@/src/components/common/EmptyState/EmptyState";
import SearchBar from "@/src/components/common/SearchBar";
import {formatCurrency, getImageUrl} from "@utils/formatters";
import {ROUTE_NAMES} from "@/src/navigation";
import {COLORS} from "@/src/styles/colors";
import MapView from "@/src/components/common/MapView";
import styles from "./styles";

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

  // --- State: Promotions ---
  const [promotions, setPromotions] = useState<any[]>([]);
  const [isLoadingPromotions, setIsLoadingPromotions] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<any>(null);
  const [showPromotionModal, setShowPromotionModal] = useState(false);

  // --- Animation Refs ---
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnims = useRef([new Animated.Value(1), new Animated.Value(0.95), new Animated.Value(0.95)]).current;

  const store = dataSource === "nearby" ? nearbyStore : allStore;

  // --- Effects ---

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoadingCategories(true);
        const categoriesData = await CategoryService.getCategories();
        setCategories(categoriesData);

        setIsLoadingPromotions(true);
        const promotionsRes = await PromotionService.getActivePromotions();
        setPromotions(promotionsRes.data || []);
      } catch (error) {
        console.error("Failed to fetch initial data", error);
      } finally {
        setIsLoadingCategories(false);
        setIsLoadingPromotions(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    handleFetchData();
  }, [location, dataSource, selectedCategory]);

  // Sync Store Items to Map Markers
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

  // Animate tabs when dataSource changes
  useEffect(() => {
    const tabs = ["nearby", "all", "toprated"];
    const activeIndex = tabs.indexOf(dataSource);
    const tabWidth = (width - 40 - 16) / 3; // 40 = horizontal padding, 16 = total gap (8*2)

    // Slide indicator
    Animated.spring(slideAnim, {
      toValue: activeIndex * (tabWidth + 8), // 8 = gap between tabs
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();

    // Scale animations
    scaleAnims.forEach((anim, index) => {
      Animated.spring(anim, {
        toValue: index === activeIndex ? 1 : 0.95,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    });
  }, [dataSource]);

  // --- Handlers ---

  const handleCopyCode = async (code: string) => {
    try {
      await Clipboard.setStringAsync(code);
      Alert.alert("Thành công", `Đã sao chép mã: ${code}`);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể sao chép mã");
    }
  };

  const handleFetchData = () => {
    const params: any = {};

    // Logic lọc theo danh mục
    if (selectedCategory) {
      params.categoryId = selectedCategory;
    }

    // Logic lọc theo từ khóa tìm kiếm
    if (searchQuery) {
      store.search(searchQuery);
      return;
    }

    if (dataSource === "nearby" && location) {
      nearbyStore.fetchNearby(location.latitude, location.longitude, 5);

      if (selectedCategory) {
        filterByCategory(selectedCategory);
      }
    } else if (dataSource === "all") {
      allStore.fetchAll({page: 1, limit: 10, ...params});
    } else if (dataSource === "toprated") {
      allStore.fetchAll({rating_gte: 4.5, page: 1, limit: 10, sort: "rating", order: "desc", ...params});
    }
  };

  const handleRefresh = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    clearAllFilters();

    if (location && dataSource === "nearby") {
      nearbyStore.fetchNearby(location.latitude, location.longitude, 5);
    } else {
      allStore.fetchAll({page: 1, limit: 10});
    }

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

  const handleCategorySelect = (categoryId: number) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(null);
      clearAllFilters();
    } else {
      setSelectedCategory(categoryId);
      filterByCategory(categoryId);
    }
  };

  const handlePromotionPress = (promotion: any) => {
    setSelectedPromotion(promotion);
    setShowPromotionModal(true);
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

  // [FIXED] Sử dụng useCallback và giữ border cố định để tránh mất ảnh
  const renderCategoryItem = useCallback(
    ({item}: {item: Category}) => {
      const isSelected = selectedCategory === item.id;

      return (
        <TouchableOpacity
          style={[styles.categoryItem, isSelected && styles.categoryItemActive]}
          onPress={() => handleCategorySelect(item.id)}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.categoryIconContainer,
              {
                borderWidth: 1,
                borderColor: isSelected ? COLORS.PRIMARY : "transparent",
                backgroundColor: isSelected ? "#FFE5E5" : "#F3F4F6",
              },
            ]}
          >
            {item.image ? (
              <Image source={{uri: getImageUrl(item.image)}} style={styles.categoryImage} resizeMode="cover" />
            ) : (
              <Text style={{fontSize: 24}}>{item.icon || "🍽️"}</Text>
            )}
          </View>

          <Text style={[styles.categoryName, isSelected && {color: COLORS.PRIMARY, fontWeight: "bold"}]}>
            {item.name}
          </Text>
        </TouchableOpacity>
      );
    },
    [selectedCategory, handleCategorySelect]
  );

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

        <TouchableOpacity style={[styles.iconButton, styles.filterButton]} onPress={() => setShowFilters(true)}>
          <Ionicons name="options" size={22} color={COLORS.WHITE} />
        </TouchableOpacity>
      </View>

      {/* Categories */}
      {layoutMode === "list" && (
        <>
          <View style={styles.categoriesSection}>
            <FlatList
              data={categories}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
              extraData={selectedCategory}
            />
          </View>

          {/* Promotions Banner */}
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.bannersContainer}
            snapToInterval={width - 40 + 12}
          >
            {isLoadingPromotions ? (
              <View style={[styles.bannerCard, {backgroundColor: COLORS.LIGHT_GRAY, justifyContent: "center"}]}>
                <ActivityIndicator size="small" color={COLORS.PRIMARY} />
              </View>
            ) : promotions.length > 0 ? (
              promotions.slice(0, 5).map((promo) => (
                <TouchableOpacity
                  key={promo.id}
                  style={[styles.bannerCard, {backgroundColor: getBannerColor(promo.discountType)}]}
                  onPress={() => handlePromotionPress(promo)}
                  activeOpacity={0.8}
                >
                  <View style={styles.bannerContent}>
                    <View style={styles.bannerIconBg}>
                      <Ionicons
                        name={getBannerIcon(promo.discountType)}
                        size={24}
                        color={getBannerColor(promo.discountType)}
                      />
                    </View>
                    <View style={{flex: 1}}>
                      <Text style={styles.bannerTitle}>{promo.code}</Text>
                      <Text style={styles.bannerSubtitle} numberOfLines={1}>
                        {promo.description}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : null}
          </ScrollView>
        </>
      )}

      {/* Smooth Animated Tabs */}
      <View style={styles.tabContainer}>
        {/* Animated Background Indicator */}
        <Animated.View
          style={[
            styles.activeIndicator,
            {
              width: (width - 40 - 16) / 3,
              transform: [{translateX: slideAnim}],
            },
          ]}
        />

        {/* Tab Buttons */}
        {[
          {mode: "nearby" as const, label: "Gần tôi", icon: "location", index: 0},
          {mode: "all" as const, label: "Phổ biến", icon: "restaurant", index: 1},
          {mode: "toprated" as const, label: "Đánh giá cao", icon: "star", index: 2},
        ].map((btn) => {
          const isActive = dataSource === btn.mode;

          return (
            <Animated.View key={btn.mode} style={[styles.tabWrapper, {transform: [{scale: scaleAnims[btn.index]}]}]}>
              <TouchableOpacity
                style={styles.tabButton}
                onPress={() => {
                  setDataSource(btn.mode);
                  setSearchQuery("");
                }}
                activeOpacity={0.7}
              >
                <Ionicons name={btn.icon as any} size={16} color={isActive ? COLORS.WHITE : COLORS.GRAY} />
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{btn.label}</Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>

      {store.items.length > 0 && <Text style={styles.resultCountText}>{store.items.length} kết quả</Text>}
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

  const getBannerColor = (type: string) => {
    switch (type) {
      case "percentage":
        return "#FF6B6B";
      case "fixed":
        return "#4ECDC4";
      case "delivery":
        return "#FFB800";
      default:
        return COLORS.PRIMARY;
    }
  };

  const getBannerIcon = (type: string): any => {
    switch (type) {
      case "percentage":
        return "pricetag";
      case "fixed":
        return "gift";
      case "delivery":
        return "bicycle";
      default:
        return "ticket";
    }
  };

  const renderRestaurantItem = (restaurant: any) => (
    <TouchableOpacity
      key={restaurant.id}
      style={styles.restaurantCard}
      onPress={() => handleRestaurantPress(restaurant.id)}
      activeOpacity={0.9}
    >
      <View style={styles.restaurantImageContainer}>
        {restaurant.image ? (
          <Image source={{uri: getImageUrl(restaurant.image)}} style={styles.restaurantImage} resizeMode="cover" />
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

  const renderPromotionModal = () => {
    if (!selectedPromotion) return null;

    const discount =
      selectedPromotion.discountType === "percentage"
        ? `${selectedPromotion.discountValue}%`
        : formatCurrency(selectedPromotion.discountValue);

    return (
      <Modal
        visible={showPromotionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPromotionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.promotionModalContent}>
            <View style={styles.promotionModalHeader}>
              <View
                style={[
                  styles.promoIconLarge,
                  {backgroundColor: getBannerColor(selectedPromotion.discountType) + "20"},
                ]}
              >
                <Ionicons
                  name={getBannerIcon(selectedPromotion.discountType)}
                  size={40}
                  color={getBannerColor(selectedPromotion.discountType)}
                />
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowPromotionModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.DARK} />
              </TouchableOpacity>
            </View>

            <View style={styles.promoCodeSection}>
              <Text style={styles.promoCodeText}>{selectedPromotion.code}</Text>
              <TouchableOpacity style={styles.copyButton} onPress={() => handleCopyCode(selectedPromotion.code)}>
                <Ionicons name="copy-outline" size={18} color={COLORS.PRIMARY} />
                <Text style={styles.copyText}>Sao chép</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.promoDescription}>{selectedPromotion.description}</Text>

            <View style={styles.promoDetailsContainer}>
              <View style={styles.promoDetailRow}>
                <Ionicons name="pricetag" size={20} color={COLORS.PRIMARY} />
                <Text style={styles.promoDetailLabel}>Giảm giá:</Text>
                <Text style={styles.promoDetailValue}>{discount}</Text>
              </View>

              {selectedPromotion.minOrderValue > 0 && (
                <View style={styles.promoDetailRow}>
                  <Ionicons name="cart" size={20} color={COLORS.INFO} />
                  <Text style={styles.promoDetailLabel}>Đơn tối thiểu:</Text>
                  <Text style={styles.promoDetailValue}>{formatCurrency(selectedPromotion.minOrderValue)}</Text>
                </View>
              )}

              {selectedPromotion.maxDiscount && (
                <View style={styles.promoDetailRow}>
                  <Ionicons name="arrow-down-circle" size={20} color={COLORS.SUCCESS} />
                  <Text style={styles.promoDetailLabel}>Giảm tối đa:</Text>
                  <Text style={styles.promoDetailValue}>{formatCurrency(selectedPromotion.maxDiscount)}</Text>
                </View>
              )}

              <View style={styles.promoDetailRow}>
                <Ionicons name="calendar" size={20} color={COLORS.WARNING} />
                <Text style={styles.promoDetailLabel}>Hạn sử dụng:</Text>
                <Text style={styles.promoDetailValue}>
                  {new Date(selectedPromotion.validTo).toLocaleDateString("vi-VN")}
                </Text>
              </View>
            </View>

            <Button
              title="Sử dụng ngay"
              onPress={() => {
                setShowPromotionModal(false);
                navigation.navigate("Search");
              }}
              containerStyle={{marginTop: 12}}
            />
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.WHITE} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={store.isRefreshing} onRefresh={handleRefresh} colors={[COLORS.PRIMARY]} />
        }
        contentContainerStyle={{paddingBottom: 50}}
      >
        {renderHeader()}

        {layoutMode === "map" ? <View style={{height: 400, marginTop: 10}}>{renderMapView()}</View> : renderListView()}
      </ScrollView>

      {renderFilterModal()}
      {renderMapPreviewModal()}
      {renderPromotionModal()}
    </View>
  );
};

export default HomeScreen;
