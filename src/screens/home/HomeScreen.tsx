import React, {useState, useEffect} from "react";
import {View, StyleSheet, Text, TouchableOpacity} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {useNearbyRestaurants, useRestaurantStore} from "@stores/restaurantStore";
import {useGeolocation} from "@hooks/useGeolocation";
import BaseList from "@components/common/BaseList";
import Card from "@components/common/Card";
import {COLORS} from "@/src/config/constants";

/**
 * HomeScreen với BaseList và Store integration
 *
 * Features:
 * - View mode toggle (Nearby / All)
 * - GPS-based nearby search
 * - Pull to refresh
 * - Infinite scroll
 * - Auto fetch on mount
 * - Loading states
 * - Error handling
 */
const HomeScreen = ({navigation}: any) => {
  const {location} = useGeolocation();
  const [viewMode, setViewMode] = useState<"nearby" | "all">("nearby");

  // Store for nearby restaurants
  const nearbyStore = useNearbyRestaurants();

  // Store for all restaurants
  const allStore = useRestaurantStore();

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
      allStore.fetchAll();
    }
  }, [viewMode]);

  const handleRestaurantPress = (restaurantId: number) => {
    navigation.navigate("RestaurantDetail", {restaurantId});
  };

  const handleViewModeChange = (mode: "nearby" | "all") => {
    setViewMode(mode);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>{viewMode === "nearby" ? "Nearby Restaurants" : "All Restaurants"}</Text>

      {location && viewMode === "nearby" && (
        <Text style={styles.locationText}>
          📍 {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
        </Text>
      )}

      {/* View Mode Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === "nearby" && styles.toggleButtonActive]}
          onPress={() => handleViewModeChange("nearby")}
        >
          <Ionicons name="navigate" size={16} color={viewMode === "nearby" ? COLORS.WHITE : COLORS.PRIMARY} />
          <Text style={[styles.toggleText, viewMode === "nearby" && styles.toggleTextActive]}>Nearby</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleButton, viewMode === "all" && styles.toggleButtonActive]}
          onPress={() => handleViewModeChange("all")}
        >
          <Ionicons name="list" size={16} color={viewMode === "all" ? COLORS.WHITE : COLORS.PRIMARY} />
          <Text style={[styles.toggleText, viewMode === "all" && styles.toggleTextActive]}>All</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      {store.items.length > 0 && (
        <Text style={styles.stats}>
          Showing {store.items.length} of {store.totalItems} restaurants
        </Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <BaseList
        items={store.items}
        isLoading={store.isLoading}
        isRefreshing={store.isRefreshing}
        isLoadingMore={store.isLoadingMore}
        error={store.error}
        hasMore={store.hasMore}
        fetchAll={store.fetchAll}
        fetchMore={store.fetchMore}
        refresh={store.refresh}
        renderItem={(restaurant) => (
          <Card
            key={restaurant.id}
            image={restaurant.image}
            title={restaurant.name}
            subtitle={restaurant.address}
            rating={restaurant.rating}
            description={`${restaurant.distance?.toFixed(1) || "0"}km • ${restaurant.deliveryTime || "30-40 min"}`}
            badge={restaurant.isOpen ? "Open" : "Closed"}
            onPress={() => handleRestaurantPress(restaurant.id)}
          />
        )}
        keyExtractor={(restaurant) => restaurant.id.toString()}
        ListHeaderComponent={renderHeader()}
        emptyIcon="restaurant-outline"
        emptyTitle="No restaurants found"
        emptySubtitle={
          viewMode === "nearby"
            ? "No restaurants nearby. Try expanding your search radius."
            : "No restaurants available at the moment."
        }
        autoFetch={false} // We handle fetch manually based on view mode
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.DARK,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    color: COLORS.GRAY,
    marginBottom: 12,
  },
  toggleContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
    gap: 6,
  },
  toggleButtonActive: {
    backgroundColor: COLORS.PRIMARY,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.PRIMARY,
  },
  toggleTextActive: {
    color: COLORS.WHITE,
  },
  stats: {
    fontSize: 12,
    color: COLORS.GRAY,
    marginTop: 8,
  },
});

export default HomeScreen;
