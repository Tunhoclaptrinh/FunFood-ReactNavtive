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
  SectionList,
  Image,
  Dimensions,
} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {useNearbyRestaurants, useRestaurantStore, useRestaurantFilters} from "@stores/restaurantStore";
import {useGeolocation} from "@hooks/useGeolocation";
import Card from "@components/common/Card";
import Button from "@components/common/Button";
import Input from "@components/common/Input";
import EmptyState from "@components/common/EmptyState";
import {formatCurrency} from "@utils/formatters";
import {COLORS} from "@/src/config/constants";

const {width} = Dimensions.get("window");

/**
 * Trang Home hoàn thiện với:
 * - Greeting header với thời gian
 * - Location display + change location
 * - Search bar + quick filters
 * - Banner carousel (promotions)
 * - Categories slider
 * - View mode toggle (Nearby/All/Top Rated)
 * - Advanced filters
 * - Restaurant listings
 * - Pull to refresh
 * - Infinite scroll
 * - Loading states
 * - Error handling
 */
const HomeScreen = ({navigation}: any) => {
  const {location, requestLocation} = useGeolocation();
  const nearbyStore = useNearbyRestaurants();
  const allStore = useRestaurantStore();
  const {filterByCategory, filterByRating, filterByOpen, clearAllFilters} = useRestaurantFilters();

  const [viewMode, setViewMode] = useState<"nearby" | "all" | "toprated">("nearby");
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [categories] = useState([
    {id: 1, name: "Vietnamese", icon: "🍲"},
    {id: 2, name: "Pizza", icon: "🍕"},
    {id: 3, name: "Burgers", icon: "🍔"},
    {id: 4, name: "Sushi", icon: "🍣"},
    {id: 5, name: "Dessert", icon: "🍰"},
    {id: 6, name: "Drinks", icon: "☕"},
  ]);

  const [banners] = useState([
    {id: 1, title: "50% OFF", subtitle: "First Order", color: "#FF6B6B"},
    {id: 2, title: "FREE DELIVERY", subtitle: "Orders over 100K", color: "#4ECDC4"},
    {id: 3, title: "BONUS POINTS", subtitle: "Every Purchase", color: "#FFB800"},
  ]);

  // Select active store based on view mode
  const store = viewMode === "nearby" ? nearbyStore : allStore;

  // Fetch nearby restaurants when location is available
  useEffect(() => {
    if (location && viewMode === "nearby") {
      nearbyStore.fetchNearby(location.latitude, location.longitude, 5);
    }
  }, [location, viewMode]);

  // Fetch all restaurants when switching to "all" mode
  useEffect(() => {
    if (viewMode === "all") {
      allStore.fetchAll({page: 1, limit: 10});
    } else if (viewMode === "toprated") {
      allStore.fetchAll({rating_gte: 4.5, page: 1, limit: 10, sort: "rating", order: "desc"});
    }
  }, [viewMode]);

  const handleRestaurantPress = (restaurantId: number) => {
    navigation.navigate("RestaurantDetail", {restaurantId});
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
      store.fetchAll();
    }
  };

  const handleRefresh = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    clearAllFilters();
    if (viewMode === "nearby" && location) {
      nearbyStore.fetchNearby(location.latitude, location.longitude, 5);
    } else if (viewMode === "all") {
      allStore.fetchAll({page: 1, limit: 10});
    } else {
      allStore.fetchAll({rating_gte: 4.5, page: 1, limit: 10, sort: "rating", order: "desc"});
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning ☀️";
    if (hour < 18) return "Good Afternoon 🌤️";
    return "Good Evening 🌙";
  };

  // Header with location and greeting
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Greeting */}
      <View style={styles.greetingSection}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.greetingSubtitle}>Ready to eat?</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton} onPress={() => navigation.navigate("Notifications")}>
          <Ionicons name="notifications-outline" size={24} color={COLORS.PRIMARY} />
          <View style={styles.notificationBadge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Location Display */}
      <View style={styles.locationSection}>
        <View style={styles.locationInfo}>
          <Ionicons name="location-outline" size={20} color={COLORS.PRIMARY} />
          <View style={styles.locationText}>
            <Text style={styles.locationLabel}>Current Location</Text>
            <Text style={styles.locationAddress} numberOfLines={1}>
              {location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : "Detecting..."}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.changeLocationButton} onPress={requestLocation}>
          <Ionicons name="refresh-outline" size={20} color={COLORS.PRIMARY} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color={COLORS.GRAY} />
          <Input
            placeholder="Search restaurants or food..."
            value={searchQuery}
            onChangeText={handleSearch}
            containerStyle={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch("")}>
              <Ionicons name="close-circle" size={20} color={COLORS.GRAY} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(!showFilters)}>
          <Ionicons name="options-outline" size={20} color={COLORS.WHITE} />
        </TouchableOpacity>
      </View>

      {/* Categories Slider */}
      <View style={styles.categoriesSection}>
        <Text style={styles.categoriesTitle}>What are you craving?</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
          scrollEventThrottle={16}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryChip, selectedCategory === cat.id && styles.categoryChipActive]}
              onPress={() => handleCategorySelect(cat.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.categoryIcon}>{cat.icon}</Text>
              <Text style={[styles.categoryName, selectedCategory === cat.id && styles.categoryNameActive]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Banners Carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.bannersContainer}
        scrollEventThrottle={16}
      >
        {banners.map((banner) => (
          <TouchableOpacity
            key={banner.id}
            style={[styles.bannerCard, {backgroundColor: banner.color}]}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("Promotions")}
          >
            <View>
              <Text style={styles.bannerTitle}>{banner.title}</Text>
              <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>
            </View>
            <Ionicons name="arrow-forward" size={24} color={COLORS.WHITE} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* View Mode Toggle */}
      <View style={styles.viewModeSection}>
        <Text style={styles.viewModeTitle}>Showing</Text>
        <View style={styles.viewModeButtons}>
          {[
            {mode: "nearby" as const, label: "Nearby", icon: "navigate"},
            {mode: "all" as const, label: "All", icon: "list"},
            {mode: "toprated" as const, label: "Top Rated", icon: "star"},
          ].map((btn) => (
            <TouchableOpacity
              key={btn.mode}
              style={[styles.viewModeButton, viewMode === btn.mode && styles.viewModeButtonActive]}
              onPress={() => handleViewModeChange(btn.mode)}
            >
              <Ionicons
                name={btn.icon as any}
                size={14}
                color={viewMode === btn.mode ? COLORS.WHITE : COLORS.PRIMARY}
              />
              <Text style={[styles.viewModeText, viewMode === btn.mode && styles.viewModeTextActive]}>{btn.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Stats */}
      {store.items.length > 0 && (
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.SUCCESS} />
            <Text style={styles.statText}>Showing {store.items.length} results</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="flash" size={16} color={COLORS.WARNING} />
            <Text style={styles.statText}>Total {store.totalItems} available</Text>
          </View>
        </View>
      )}
    </View>
  );

  // Restaurant Card with distance
  const renderRestaurantItem = (restaurant: any) => (
    <TouchableOpacity
      style={styles.restaurantCardWrapper}
      onPress={() => handleRestaurantPress(restaurant.id)}
      activeOpacity={0.7}
    >
      <View style={styles.restaurantCard}>
        {/* Image */}
        <View style={styles.restaurantImageContainer}>
          {restaurant.image ? (
            <Image source={{uri: restaurant.image}} style={styles.restaurantImage} />
          ) : (
            <View style={[styles.restaurantImage, styles.placeholderImage]}>
              <Ionicons name="storefront-outline" size={40} color={COLORS.LIGHT_GRAY} />
            </View>
          )}

          {/* Badge */}
          <View style={[styles.restaurantBadge, {backgroundColor: restaurant.isOpen ? COLORS.SUCCESS : COLORS.ERROR}]}>
            <Text style={styles.badgeText}>{restaurant.isOpen ? "Open" : "Closed"}</Text>
          </View>

          {/* Rating */}
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={14} color="#FFB800" />
            <Text style={styles.ratingText}>{restaurant.rating?.toFixed(1) || "0"}</Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName} numberOfLines={1}>
            {restaurant.name}
          </Text>
          <Text style={styles.restaurantCategory} numberOfLines={1}>
            {restaurant.address}
          </Text>

          {/* Details Row */}
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={12} color={COLORS.GRAY} />
              <Text style={styles.detailText}>{restaurant.deliveryTime || "30-40m"}</Text>
            </View>

            <View style={styles.detailItem}>
              <Ionicons name="bicycle-outline" size={12} color={COLORS.GRAY} />
              <Text style={styles.detailText}>
                {restaurant.distance ? `${restaurant.distance.toFixed(1)}km` : "0km"}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Ionicons name="cash-outline" size={12} color={COLORS.GRAY} />
              <Text style={styles.detailText}>{formatCurrency(restaurant.deliveryFee || 15000)}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Handle loading and empty states
  if (store.isLoading && store.items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={false} onRefresh={handleRefresh} colors={[COLORS.PRIMARY]} />}
        >
          {renderHeader()}
        </ScrollView>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Finding great restaurants...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (store.error && store.items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={false} onRefresh={handleRefresh} colors={[COLORS.PRIMARY]} />}
        >
          {renderHeader()}
        </ScrollView>
        <View style={styles.errorContainer}>
          <EmptyState
            icon="alert-circle-outline"
            title="Something went wrong"
            subtitle={store.error || "Please try again later"}
          />
          <Button title="Retry" onPress={handleRefresh} style={styles.retryButton} />
        </View>
      </SafeAreaView>
    );
  }

  if (store.items.length === 0 && !store.isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={false} onRefresh={handleRefresh} colors={[COLORS.PRIMARY]} />}
        >
          {renderHeader()}
        </ScrollView>
        <View style={styles.emptyContainer}>
          <EmptyState
            icon="restaurant-outline"
            title={searchQuery ? "No restaurants found" : "No restaurants available"}
            subtitle={
              searchQuery
                ? "Try a different search term"
                : viewMode === "nearby"
                ? "Try expanding your search radius"
                : "Check back soon!"
            }
          />
          {searchQuery && <Button title="Clear Search" onPress={() => handleSearch("")} style={styles.clearButton} />}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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
        onMomentumScrollEnd={() => {
          if (store.hasMore && !store.isLoadingMore) {
            store.fetchMore();
          }
        }}
      >
        {/* Header */}
        {renderHeader()}

        {/* Restaurants List */}
        <View style={styles.listSection}>
          {store.items.length > 0 && (
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>Available Restaurants</Text>
              <TouchableOpacity onPress={handleRefresh}>
                <Ionicons name="refresh-outline" size={18} color={COLORS.PRIMARY} />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.restaurantsList}>
            {store.items.map((restaurant) => (
              <View key={restaurant.id}>{renderRestaurantItem(restaurant)}</View>
            ))}
          </View>

          {/* Load More Indicator */}
          {store.isLoadingMore && (
            <View style={styles.loadMoreContainer}>
              <ActivityIndicator size="small" color={COLORS.PRIMARY} />
              <Text style={styles.loadMoreText}>Loading more restaurants...</Text>
            </View>
          )}

          {/* No More Results */}
          {!store.hasMore && store.items.length > 5 && (
            <View style={styles.endOfListContainer}>
              <Ionicons name="checkmark-done" size={32} color={COLORS.LIGHT_GRAY} />
              <Text style={styles.endOfListText}>You've seen all restaurants</Text>
              <Text style={styles.endOfListSubtext}>Showing {store.items.length} total restaurants</Text>
            </View>
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: COLORS.WHITE,
  },
  greetingSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.DARK,
  },
  greetingSubtitle: {
    fontSize: 12,
    color: COLORS.GRAY,
    marginTop: 2,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.LIGHT_GRAY,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: COLORS.ERROR,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: COLORS.WHITE,
    fontSize: 10,
    fontWeight: "bold",
  },
  locationSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  locationInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  locationText: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 11,
    color: COLORS.GRAY,
    fontWeight: "500",
  },
  locationAddress: {
    fontSize: 12,
    color: COLORS.DARK,
    fontWeight: "600",
    marginTop: 2,
  },
  changeLocationButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.WHITE,
    justifyContent: "center",
    alignItems: "center",
  },
  searchSection: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    marginVertical: 0,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: "center",
    alignItems: "center",
  },
  categoriesSection: {
    marginBottom: 12,
  },
  categoriesTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.DARK,
    marginBottom: 10,
  },
  categoriesContainer: {
    paddingRight: 16,
    gap: 8,
  },
  categoryChip: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.LIGHT_GRAY,
    backgroundColor: COLORS.WHITE,
    gap: 4,
  },
  categoryChipActive: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
  categoryIcon: {
    fontSize: 20,
  },
  categoryName: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.DARK,
  },
  categoryNameActive: {
    color: COLORS.WHITE,
  },
  bannersContainer: {
    paddingRight: 16,
    marginBottom: 12,
    gap: 12,
  },
  bannerCard: {
    width: width - 70,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.WHITE,
    marginBottom: 2,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: COLORS.WHITE,
    opacity: 0.9,
  },
  viewModeSection: {
    marginBottom: 12,
  },
  viewModeTitle: {
    fontSize: 12,
    color: COLORS.GRAY,
    fontWeight: "500",
    marginBottom: 8,
  },
  viewModeButtons: {
    flexDirection: "row",
    gap: 8,
  },
  viewModeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
    gap: 4,
  },
  viewModeButtonActive: {
    backgroundColor: COLORS.PRIMARY,
  },
  viewModeText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.PRIMARY,
  },
  viewModeTextActive: {
    color: COLORS.WHITE,
  },
  statsSection: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.LIGHT_GRAY,
    marginTop: 12,
  },
  statItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    fontSize: 11,
    color: COLORS.GRAY,
    fontWeight: "500",
  },
  listSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.DARK,
  },
  restaurantsList: {
    gap: 12,
  },
  restaurantCardWrapper: {
    marginBottom: 4,
  },
  restaurantCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.LIGHT_GRAY,
  },
  restaurantImageContainer: {
    position: "relative",
    width: "100%",
    height: 160,
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
  restaurantBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  ratingBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.WHITE,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.DARK,
  },
  restaurantInfo: {
    padding: 12,
  },
  restaurantName: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.DARK,
    marginBottom: 4,
  },
  restaurantCategory: {
    fontSize: 12,
    color: COLORS.GRAY,
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: "row",
    gap: 12,
  },
  detailItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailText: {
    fontSize: 11,
    color: COLORS.GRAY,
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.GRAY,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  retryButton: {
    marginTop: 20,
    minWidth: 120,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  clearButton: {
    marginTop: 20,
    minWidth: 120,
  },
  loadMoreContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    gap: 8,
  },
  loadMoreText: {
    fontSize: 12,
    color: COLORS.GRAY,
  },
  endOfListContainer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  endOfListText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.GRAY,
    marginTop: 8,
  },
  endOfListSubtext: {
    fontSize: 12,
    color: COLORS.GRAY,
    marginTop: 4,
  },
  bottomPadding: {
    height: 40,
  },
});

export default HomeScreen;
