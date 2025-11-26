/**
 * HomeScreen with Integrated Google Maps
 * Switch between List View and Map View
 */

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
  Dimensions,
  Modal,
} from "react";
import {Ionicons} from "@expo/vector-icons";
import {useNearbyRestaurants} from "@stores/restaurantStore";
import {useGeolocation} from "@hooks/useGeolocation";

import {MapService, MapMarker} from "@services/map.service";
import SearchBar from "@/src/components/common/SearchBar";
import EmptyState from "@/src/components/common/EmptyState/EmptyState";
import {COLORS} from "@/src/styles/colors";
import {ROUTE_NAMES} from "@/src/navigation";
import MapViewComponent from "@/src/components/common/MapViewComponent";

const {width, height} = Dimensions.get("window");

type ViewMode = "list" | "map";

const HomeScreenWithMap = ({navigation}: any) => {
  // --- Hooks & Stores ---
  const {location, requestLocation} = useGeolocation();
  const nearbyStore = useNearbyRestaurants();

  // --- Local State ---
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);
  const [showRestaurantModal, setShowRestaurantModal] = useState(false);
  const [mapMarkers, setMapMarkers] = useState<MapMarker[]>([]);

  // --- Effects ---
  useEffect(() => {
    if (location) {
      loadNearbyRestaurants();
    }
  }, [location]);

  // Update map markers when restaurants change
  useEffect(() => {
    if (nearbyStore.items.length > 0) {
      const markers = nearbyStore.items
        .filter((r) => r.latitude && r.longitude)
        .map((r) => MapService.createRestaurantMarker(r));
      setMapMarkers(markers);
    }
  }, [nearbyStore.items]);

  // --- Handlers ---
  const loadNearbyRestaurants = useCallback(() => {
    if (location) {
      nearbyStore.fetchNearby(location.latitude, location.longitude, 10);
    }
  }, [location]);

  const handleRestaurantPress = (restaurantId: number) => {
    navigation.navigate(ROUTE_NAMES.HOME.RESTAURANT_DETAIL, {restaurantId});
  };

  const handleMapMarkerPress = (marker: MapMarker) => {
    // Find restaurant from marker ID
    const restaurantId = parseInt(marker.id.replace("restaurant-", ""));
    const restaurant = nearbyStore.items.find((r) => r.id === restaurantId);

    if (restaurant) {
      setSelectedRestaurant(restaurant);
      setShowRestaurantModal(true);
    }
  };

  const handleRefresh = () => {
    setSearchQuery("");
    loadNearbyRestaurants();
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      nearbyStore.search(query);
    } else if (query.length === 0) {
      loadNearbyRestaurants();
    }
  };

  // --- Render Functions ---
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Greeting */}
      <View style={styles.greetingSection}>
        <Text style={styles.greeting}>Chào buổi {getGreeting()}</Text>
        <Text style={styles.greetingSubtitle}>Hôm nay bạn muốn ăn gì?</Text>
      </View>

      {/* Search */}
      <View style={styles.searchSection}>
        <View style={{flex: 1}}>
          <SearchBar
            value={searchQuery}
            onChangeText={handleSearch}
            onClear={() => handleSearch("")}
            placeholder="Tìm món ăn, nhà hàng..."
          />
        </View>
      </View>

      {/* View Mode Toggle */}
      <View style={styles.viewModeToggle}>
        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === "list" && styles.viewModeButtonActive]}
          onPress={() => setViewMode("list")}
          activeOpacity={0.7}
        >
          <Ionicons name="list" size={20} color={viewMode === "list" ? COLORS.WHITE : COLORS.GRAY} />
          <Text style={[styles.viewModeText, viewMode === "list" && styles.viewModeTextActive]}>Danh sách</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === "map" && styles.viewModeButtonActive]}
          onPress={() => setViewMode("map")}
          activeOpacity={0.7}
        >
          <Ionicons name="map" size={20} color={viewMode === "map" ? COLORS.WHITE : COLORS.GRAY} />
          <Text style={[styles.viewModeText, viewMode === "map" && styles.viewModeTextActive]}>Bản đồ</Text>
        </TouchableOpacity>
      </View>

      {/* Results Count */}
      {nearbyStore.items.length > 0 && (
        <Text style={styles.resultCountText}>Tìm thấy {nearbyStore.items.length} nhà hàng gần bạn</Text>
      )}
    </View>
  );

  const renderRestaurantCard = (restaurant: any) => (
    <TouchableOpacity
      key={restaurant.id}
      style={styles.restaurantCard}
      onPress={() => handleRestaurantPress(restaurant.id)}
      activeOpacity={0.9}
    >
      <View style={styles.restaurantImageContainer}>
        <View style={[styles.restaurantImage, styles.placeholderImage]}>
          <Ionicons name="restaurant" size={40} color={COLORS.GRAY} />
        </View>

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
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderListView = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={nearbyStore.isRefreshing}
          onRefresh={handleRefresh}
          colors={[COLORS.PRIMARY]}
          tintColor={COLORS.PRIMARY}
        />
      }
      contentContainerStyle={styles.listContent}
    >
      {nearbyStore.isLoading && nearbyStore.items.length === 0 ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Đang tìm nhà hàng...</Text>
        </View>
      ) : nearbyStore.items.length === 0 ? (
        <EmptyState icon="search" title="Không tìm thấy nhà hàng" subtitle="Hãy thử tìm kiếm với từ khóa khác" />
      ) : (
        <View style={styles.restaurantGrid}>
          {nearbyStore.items.map((restaurant) => renderRestaurantCard(restaurant))}
        </View>
      )}
    </ScrollView>
  );

  const renderMapView = () => {
    if (!location) {
      return (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Đang xác định vị trí...</Text>
        </View>
      );
    }

    return (
      <MapViewComponent
        markers={mapMarkers}
        onMarkerPress={handleMapMarkerPress}
        enableTracking={true}
        style={styles.map}
      />
    );
  };

  const renderRestaurantModal = () => {
    if (!selectedRestaurant) return null;

    return (
      <Modal
        visible={showRestaurantModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRestaurantModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowRestaurantModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.DARK} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Thông tin nhà hàng</Text>
              <View style={{width: 24}} />
            </View>

            {/* Restaurant Info */}
            <ScrollView style={styles.modalBody}>
              <View style={styles.modalRestaurantCard}>
                <Text style={styles.modalRestaurantName}>{selectedRestaurant.name}</Text>

                <View style={styles.modalMetaRow}>
                  <View style={styles.modalMetaItem}>
                    <Ionicons name="star" size={16} color="#FFB800" />
                    <Text style={styles.modalMetaText}>
                      {selectedRestaurant.rating?.toFixed(1)} ({selectedRestaurant.totalReviews} reviews)
                    </Text>
                  </View>
                </View>

                <View style={styles.modalMetaRow}>
                  <View style={styles.modalMetaItem}>
                    <Ionicons name="time-outline" size={16} color={COLORS.GRAY} />
                    <Text style={styles.modalMetaText}>{selectedRestaurant.deliveryTime || "20-30 phút"}</Text>
                  </View>
                </View>

                <View style={styles.modalMetaRow}>
                  <View style={styles.modalMetaItem}>
                    <Ionicons name="location-outline" size={16} color={COLORS.GRAY} />
                    <Text style={styles.modalMetaText}>{selectedRestaurant.address}</Text>
                  </View>
                </View>

                {selectedRestaurant.distance && (
                  <View style={styles.modalMetaRow}>
                    <View style={styles.modalMetaItem}>
                      <Ionicons name="navigate-outline" size={16} color={COLORS.INFO} />
                      <Text style={styles.modalMetaText}>Cách bạn {selectedRestaurant.distance.toFixed(1)} km</Text>
                    </View>
                  </View>
                )}
              </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setShowRestaurantModal(false);
                  handleRestaurantPress(selectedRestaurant.id);
                }}
              >
                <Text style={styles.modalButtonText}>Xem thực đơn</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "sáng ☀️";
    if (hour < 18) return "chiều 🌤️";
    return "tối 🌙";
  };

  // --- Main Render ---
  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}

      {viewMode === "list" ? renderListView() : renderMapView()}

      {renderRestaurantModal()}
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
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: COLORS.WHITE,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  greetingSection: {
    marginBottom: 12,
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
  searchSection: {
    marginBottom: 12,
  },
  viewModeToggle: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    padding: 4,
    borderRadius: 8,
    marginBottom: 8,
    gap: 4,
  },
  viewModeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  viewModeButtonActive: {
    backgroundColor: COLORS.PRIMARY,
    shadowColor: COLORS.PRIMARY,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  viewModeText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.GRAY,
  },
  viewModeTextActive: {
    color: COLORS.WHITE,
  },
  resultCountText: {
    fontSize: 12,
    color: COLORS.GRAY,
    textAlign: "center",
    marginTop: 4,
  },
  listContent: {
    padding: 16,
    paddingBottom: 20,
  },
  centerState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.GRAY,
    fontSize: 14,
  },
  restaurantGrid: {
    gap: 16,
  },
  restaurantCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  restaurantImageContainer: {
    height: 160,
    backgroundColor: COLORS.LIGHT_GRAY,
    position: "relative",
  },
  restaurantImage: {
    width: "100%",
    height: "100%",
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
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  closedText: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.ERROR,
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  restaurantInfo: {
    padding: 16,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.DARK,
    marginBottom: 8,
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
  map: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.WHITE,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "70%",
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
  modalRestaurantCard: {
    gap: 12,
  },
  modalRestaurantName: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.DARK,
    marginBottom: 8,
  },
  modalMetaRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  modalMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  modalMetaText: {
    fontSize: 14,
    color: COLORS.DARK,
    flex: 1,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.LIGHT_GRAY,
  },
  modalButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.WHITE,
  },
});

export default HomeScreenWithMap;
