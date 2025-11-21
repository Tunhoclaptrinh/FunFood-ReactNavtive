import React, {useEffect, useState} from "react";
import {View, StyleSheet, ScrollView, Text, ActivityIndicator, Platform} from "react-native";
import * as Location from "expo-location";
import {RestaurantService} from "@services/restaurant.service";
import Card from "@components/common/Card";
import EmptyState from "@components/common/EmptyState";
import {COLORS} from "@/src/config/constants";

const HomeScreen = () => {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<any>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  useEffect(() => {
    initializeScreen();
  }, []);

  const initializeScreen = async () => {
    try {
      // Get location
      await getLocation();
    } catch (error) {
      console.error("Error initializing screen:", error);
    } finally {
      setLoading(false);
    }
  };

  const getLocation = async () => {
    try {
      // Web platform: use mock location
      if (Platform.OS === "web") {
        console.log("Web platform detected, using mock location");
        const mockLocation = {
          latitude: 21.0285,
          longitude: 105.8542,
        };
        setLocation(mockLocation);
        await loadRestaurants(mockLocation);
        return;
      }

      // Mobile: request permission
      const {status} = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        console.log("Location permission denied, using mock location");
        setGeoError("Location permission denied, using default location");
        const mockLocation = {
          latitude: 21.0285,
          longitude: 105.8542,
        };
        setLocation(mockLocation);
        await loadRestaurants(mockLocation);
        return;
      }

      // Get current location
      const currentLocation = await Location.getCurrentPositionAsync({});
      const {latitude, longitude} = currentLocation.coords;

      console.log("Location obtained:", {latitude, longitude});
      setLocation({latitude, longitude});
      await loadRestaurants({latitude, longitude});
    } catch (error) {
      console.error("Geolocation error:", error);
      setGeoError("Could not get location, using default");

      // Fallback to mock location
      const mockLocation = {
        latitude: 21.0285,
        longitude: 105.8542,
      };
      setLocation(mockLocation);
      await loadRestaurants(mockLocation);
    }
  };

  const loadRestaurants = async (coords: any) => {
    try {
      setLoading(true);
      const response = await RestaurantService.getNearby({
        latitude: coords.latitude,
        longitude: coords.longitude,
        radius: 5,
        _page: 1,
        _limit: 10,
      });

      console.log("Restaurants loaded:", response.data?.length || 0);
      setRestaurants(response.data || []);
    } catch (error) {
      console.error("Error loading restaurants:", error);
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Nearby Restaurants</Text>

      {geoError && (
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>⚠️ {geoError}</Text>
        </View>
      )}

      {location && (
        <Text style={styles.locationText}>
          📍 Location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
        </Text>
      )}

      {restaurants.length > 0 ? (
        restaurants.map((restaurant: any) => (
          <Card
            key={restaurant.id}
            image={restaurant.image}
            title={restaurant.name}
            subtitle={restaurant.address}
            rating={restaurant.rating}
            description={`Distance: ${restaurant.distance?.toFixed(1) || "0"}km`}
          />
        ))
      ) : (
        <EmptyState
          icon="restaurant-outline"
          title="No Restaurants Found"
          subtitle="Try expanding your search radius"
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.WHITE},
  content: {padding: 16},
  centered: {justifyContent: "center", alignItems: "center"},
  title: {fontSize: 24, fontWeight: "bold", marginBottom: 16, color: COLORS.DARK},
  warningBox: {
    backgroundColor: "#FEF3C7",
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
    padding: 12,
    borderRadius: 4,
    marginBottom: 12,
  },
  warningText: {
    color: "#92400E",
    fontSize: 12,
  },
  locationText: {
    fontSize: 12,
    color: COLORS.GRAY,
    marginBottom: 12,
    textAlign: "center",
  },
});

export default HomeScreen;
