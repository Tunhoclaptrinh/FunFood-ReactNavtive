import React, {useEffect, useState} from "react";
import {View, StyleSheet, ScrollView, Text, ActivityIndicator} from "react-native";
import {useGeolocation} from "@hooks/useGeolocation";
import {RestaurantService} from "@services/restaurant.service";
import Card from "@components/common/Card";
import EmptyState from "@components/common/EmptyState";
import {COLORS} from "@/src/config/constants";

const HomeScreen = () => {
  const {location, loading: geoLoading} = useGeolocation();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location) {
      loadNearbyRestaurants();
    }
  }, [location]);

  const loadNearbyRestaurants = async () => {
    setLoading(true);
    try {
      const response = await RestaurantService.getNearby({
        latitude: location!.latitude,
        longitude: location!.longitude,
        radius: 5,
        _page: 1,
        _limit: 10,
      });

      // Parse dữ liệu để đảm bảo type đúng
      const parsed = response.data.map((r: any) => ({
        ...r,
        id: Number(r.id),
        rating: typeof r.rating === "string" ? parseFloat(r.rating) : Number(r.rating) || 0,
        deliveryFee: typeof r.deliveryFee === "string" ? parseFloat(r.deliveryFee) : Number(r.deliveryFee) || 0,
        distance: typeof r.distance === "string" ? parseFloat(r.distance) : Number(r.distance) || 0,
        // Bỏ qua isOpen nếu nó là string
      }));

      setRestaurants(parsed);
    } catch (error) {
      console.error("Error loading restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

  if (geoLoading || loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Nearby Restaurants</Text>

      {restaurants.length > 0 ? (
        restaurants.map((restaurant: any) => (
          <Card
            key={restaurant.id}
            image={restaurant.image}
            title={restaurant.name}
            subtitle={restaurant.address}
            rating={restaurant.rating}
            description={`Distance: ${restaurant.distance?.toFixed(1)}km`}
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
});

export default HomeScreen;
