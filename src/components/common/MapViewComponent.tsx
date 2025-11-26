/**
 * MapViewComponent - Google Maps with Full Features
 * - Display map
 * - Show markers (restaurants, delivery points)
 * - Draw routes with polyline
 * - Track current location
 * - Directions API integration
 * * UPDATED: Migrated from @react-native-community/geolocation to expo-location
 */

import React, {useEffect, useState, useRef} from "react";
import {View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Alert, Platform} from "react-native";
import MapView, {Marker, Polyline, PROVIDER_GOOGLE, Region} from "react-native-maps";
import * as Location from "expo-location"; // <-- Đổi thư viện import
import {Ionicons} from "@expo/vector-icons";
import {MapService, Location as MapLocation, MapMarker, DirectionsResult} from "@services/map.service"; // Alias Location interface to avoid conflict
import {COLORS} from "@/src/styles/colors";

interface MapViewComponentProps {
  markers?: MapMarker[];
  showRoute?: boolean;
  destination?: MapLocation;
  onMarkerPress?: (marker: MapMarker) => void;
  enableTracking?: boolean;
  initialRegion?: Region;
  style?: any;
}

const MapViewComponent: React.FC<MapViewComponentProps> = ({
  markers = [],
  showRoute = false,
  destination,
  onMarkerPress,
  enableTracking = true,
  initialRegion,
  style,
}) => {
  const mapRef = useRef<MapView>(null);

  // State
  const [currentLocation, setCurrentLocation] = useState<MapLocation | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [directions, setDirections] = useState<DirectionsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [region, setRegion] = useState<Region>(
    initialRegion || {
      latitude: 21.0285,
      longitude: 105.8542,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    }
  );

  // Subscription for location tracking
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  // Get initial location
  useEffect(() => {
    getCurrentLocation();

    // Cleanup tracking on unmount
    return () => {
      stopTracking();
    };
  }, []);

  // Fetch directions when destination changes
  useEffect(() => {
    if (showRoute && currentLocation && destination) {
      fetchDirections();
    }
  }, [showRoute, currentLocation, destination]);

  // Start/Stop tracking
  useEffect(() => {
    if (isTracking) {
      startTracking();
    } else {
      stopTracking();
    }
  }, [isTracking]);

  // Fit map to show all markers
  useEffect(() => {
    if (markers.length > 0 && mapRef.current) {
      // Add small delay to ensure map is ready
      setTimeout(() => fitToMarkers(), 500);
    }
  }, [markers]);

  /**
   * Get current location once using Expo Location
   */
  const getCurrentLocation = async () => {
    try {
      // Web platform check
      if (Platform.OS === "web") {
        // Mock location for web to prevent crash
        const mockLoc = {latitude: 21.0285, longitude: 105.8542};
        setCurrentLocation(mockLoc);
        return;
      }

      const {status} = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Quyền truy cập bị từ chối", "Vui lòng cấp quyền vị trí để sử dụng tính năng này");
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const {latitude, longitude} = location.coords;
      const coords = {latitude, longitude};
      setCurrentLocation(coords);
      setRegion({
        ...region,
        latitude,
        longitude,
      });
    } catch (error) {
      console.error("Error getting location:", error);
      // Don't alert on mount to avoid annoying user if gps is off
    }
  };

  /**
   * Start tracking location continuously using Expo Location
   */
  const startTracking = async () => {
    try {
      const {status} = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      // Stop existing subscription if any
      if (locationSubscription.current) {
        stopTracking();
      }

      const sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 10, // Update every 10 meters
          timeInterval: 5000, // Update every 5 seconds
        },
        (location) => {
          const {latitude, longitude} = location.coords;
          const coords = {latitude, longitude};
          setCurrentLocation(coords);

          // Auto center map to current location
          if (mapRef.current) {
            mapRef.current.animateToRegion({
              latitude,
              longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            });
          }
        }
      );

      locationSubscription.current = sub;
    } catch (error) {
      console.error("Error tracking location:", error);
      setIsTracking(false);
    }
  };

  /**
   * Stop tracking location
   */
  const stopTracking = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
  };

  /**
   * Toggle tracking mode
   */
  const handleToggleTracking = () => {
    setIsTracking(!isTracking);
  };

  /**
   * Fetch directions from current location to destination
   */
  const fetchDirections = async () => {
    if (!currentLocation || !destination) return;

    try {
      setLoading(true);
      const result = await MapService.getDirections(currentLocation, destination);

      if (result) {
        setDirections(result);
        // Fit map to show entire route
        if (mapRef.current && result.coordinates.length > 0) {
          const regionToFit = MapService.getRegionForCoordinates(result.coordinates);
          mapRef.current.animateToRegion(regionToFit, 1000);
        }
      } else {
        // Alert.alert("Lỗi", "Không thể tìm đường đi");
      }
    } catch (error) {
      console.error("Error fetching directions:", error);
      // Alert.alert("Lỗi", "Không thể tải chỉ đường");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Center map to current location
   */
  const handleCenterLocation = () => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } else {
      getCurrentLocation();
    }
  };

  /**
   * Fit map to show all markers
   */
  const fitToMarkers = () => {
    if (markers.length === 0) return;

    const coordinates = markers.map((m) => m.coordinate);
    if (currentLocation) {
      coordinates.push(currentLocation);
    }

    const regionToFit = MapService.getRegionForCoordinates(coordinates);

    if (mapRef.current) {
      mapRef.current.animateToRegion(regionToFit, 1000);
    }
  };

  /**
   * Get marker color based on type
   */
  const getMarkerColor = (type: string): string => {
    switch (type) {
      case "restaurant":
        return COLORS.PRIMARY;
      case "delivery":
        return COLORS.SUCCESS;
      case "current":
        return COLORS.INFO;
      default:
        return COLORS.GRAY;
    }
  };

  /**
   * Get marker icon based on type
   */
  const getMarkerIcon = (type: string): any => {
    switch (type) {
      case "restaurant":
        return "restaurant";
      case "delivery":
        return "location";
      case "current":
        return "navigate-circle";
      default:
        return "location";
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* Map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        showsUserLocation={false} // We'll use custom marker
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        loadingEnabled={true}
      >
        {/* Current Location Marker */}
        {currentLocation && (
          <Marker
            coordinate={currentLocation}
            title="Vị trí của bạn"
            description="Vị trí hiện tại"
            pinColor={COLORS.INFO}
          >
            <View style={[styles.currentLocationMarker, isTracking && styles.trackingMarker]}>
              <Ionicons name="navigate-circle" size={32} color={COLORS.INFO} />
            </View>
          </Marker>
        )}

        {/* Custom Markers */}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={marker.coordinate}
            title={marker.title}
            description={marker.description}
            pinColor={getMarkerColor(marker.type)}
            onPress={() => onMarkerPress?.(marker)}
          >
            <View style={styles.markerContainer}>
              <View style={[styles.markerIcon, {backgroundColor: getMarkerColor(marker.type)}]}>
                <Ionicons name={getMarkerIcon(marker.type) as any} size={20} color={COLORS.WHITE} />
              </View>
            </View>
          </Marker>
        ))}

        {/* Route Polyline */}
        {showRoute && directions && directions.coordinates.length > 0 && (
          <Polyline
            coordinates={directions.coordinates}
            strokeWidth={4}
            strokeColor={COLORS.PRIMARY}
            lineDashPattern={[1]}
          />
        )}
      </MapView>

      {/* Route Info Card */}
      {showRoute && directions && (
        <View style={styles.routeInfoCard}>
          <View style={styles.routeInfoRow}>
            <Ionicons name="car-outline" size={20} color={COLORS.PRIMARY} />
            <Text style={styles.routeInfoText}>
              {directions.distance.text} • {directions.duration.text}
            </Text>
          </View>
        </View>
      )}

      {/* Control Buttons */}
      <View style={styles.controls}>
        {/* Center Location Button */}
        <TouchableOpacity style={styles.controlButton} onPress={handleCenterLocation} activeOpacity={0.7}>
          <Ionicons name="locate" size={24} color={COLORS.PRIMARY} />
        </TouchableOpacity>

        {/* Tracking Toggle Button */}
        {enableTracking && (
          <TouchableOpacity
            style={[styles.controlButton, isTracking && styles.trackingActiveButton]}
            onPress={handleToggleTracking}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isTracking ? "navigate" : "navigate-outline"}
              size={24}
              color={isTracking ? COLORS.WHITE : COLORS.PRIMARY}
            />
          </TouchableOpacity>
        )}

        {/* Fit to Markers Button */}
        {markers.length > 0 && (
          <TouchableOpacity style={styles.controlButton} onPress={fitToMarkers} activeOpacity={0.7}>
            <Ionicons name="expand-outline" size={24} color={COLORS.PRIMARY} />
          </TouchableOpacity>
        )}

        {/* Refresh Directions Button */}
        {showRoute && destination && (
          <TouchableOpacity
            style={styles.controlButton}
            onPress={fetchDirections}
            activeOpacity={0.7}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.PRIMARY} />
            ) : (
              <Ionicons name="refresh-outline" size={24} color={COLORS.PRIMARY} />
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Tracking Status */}
      {isTracking && (
        <View style={styles.trackingStatus}>
          <View style={styles.trackingDot} />
          <Text style={styles.trackingText}>Đang theo dõi vị trí</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  currentLocationMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.WHITE,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: COLORS.INFO,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  trackingMarker: {
    borderColor: COLORS.SUCCESS,
    backgroundColor: "#E8F8F1",
  },
  markerContainer: {
    alignItems: "center",
  },
  markerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.WHITE,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  routeInfoCard: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  routeInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  routeInfoText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.DARK,
  },
  controls: {
    position: "absolute",
    right: 16,
    bottom: 100,
    gap: 12,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.WHITE,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  trackingActiveButton: {
    backgroundColor: COLORS.SUCCESS,
  },
  trackingStatus: {
    position: "absolute",
    bottom: 40,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.SUCCESS,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  trackingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.WHITE,
  },
  trackingText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.WHITE,
  },
});

export default MapViewComponent;
