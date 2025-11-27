/**
 * MapView - Google Maps with Full Features
 * - Display map
 * - Show markers (restaurants, delivery points)
 * - Draw routes with polyline
 * - Track current location
 * - Directions API integration
 * - Added route to selected location on map
 */

import React, {useEffect, useState, useRef} from "react";
import {View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Alert, Platform} from "react-native";
import ReactNativeMap, {Marker, Polyline, PROVIDER_GOOGLE, Region} from "react-native-maps";

import * as Location from "expo-location";
import {Ionicons} from "@expo/vector-icons";
import {MapService, Location as MapLocation, DirectionsResult} from "@services/map.service";
import {COLORS} from "@/src/styles/colors";
import {MapViewProps} from "./types";
import {styles} from "./styles";

const MapView: React.FC<MapViewProps> = ({
  markers = [],
  showRoute = false,
  destination,
  onMarkerPress,
  enableTracking = true,
  initialRegion,
  style,
}) => {
  const mapRef = useRef<ReactNativeMap>(null);

  // State
  const [currentLocation, setCurrentLocation] = useState<MapLocation | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [directions, setDirections] = useState<DirectionsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<MapLocation | null>(null);
  const [showSelectedRoute, setShowSelectedRoute] = useState(false);
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
      fetchDirections(destination);
    }
  }, [showRoute, currentLocation, destination]);

  // Fetch directions when selected destination changes
  useEffect(() => {
    if (showSelectedRoute && currentLocation && selectedDestination) {
      fetchDirections(selectedDestination);
    }
  }, [showSelectedRoute, currentLocation, selectedDestination]);

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
    }
  };

  /**
   * Start tracking location continuously using Expo Location
   */
  const startTracking = async () => {
    try {
      const {status} = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      if (locationSubscription.current) {
        stopTracking();
      }

      const sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 10,
          timeInterval: 5000,
        },
        (location) => {
          const {latitude, longitude} = location.coords;
          const coords = {latitude, longitude};
          setCurrentLocation(coords);

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
   * Handle long press on map to select destination
   */
  const handleMapLongPress = (event: any) => {
    const {latitude, longitude} = event.nativeEvent.coordinate;
    const newDestination = {latitude, longitude};

    setSelectedDestination(newDestination);
    setShowSelectedRoute(true);

    // Show feedback
    Alert.alert(
      "Điểm đến đã chọn",
      `Tọa độ: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}\nNhấn nút "X" để xóa đường đi.`,
      [{text: "OK"}]
    );
  };

  /**
   * Clear selected destination and route
   */
  const handleClearRoute = () => {
    setSelectedDestination(null);
    setShowSelectedRoute(false);
    setDirections(null);
  };

  /**
   * Fetch directions from current location to destination
   */
  const fetchDirections = async (dest: MapLocation) => {
    if (!currentLocation || !dest) return;

    try {
      setLoading(true);
      const result = await MapService.getDirections(currentLocation, dest);

      if (result) {
        setDirections(result);
        if (mapRef.current && result.coordinates.length > 0) {
          const regionToFit = MapService.getRegionForCoordinates(result.coordinates);
          mapRef.current.animateToRegion(regionToFit, 1000);
        }
      }
    } catch (error) {
      console.error("Error fetching directions:", error);
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

  // Determine which destination to show
  const activeDestination = showSelectedRoute && selectedDestination ? selectedDestination : destination;
  const shouldShowRoute = (showRoute || showSelectedRoute) && directions;

  return (
    <View style={[styles.container, style]}>
      {/* Map */}
      <ReactNativeMap
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        loadingEnabled={true}
        onLongPress={handleMapLongPress}
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
              <View style={styles.currentLocationMarkerIcon}>
                <Ionicons name="navigate-circle" size={24} color={COLORS.INFO} />
              </View>
            </View>
          </Marker>
        )}

        {/* Selected Destination Marker */}
        {selectedDestination && showSelectedRoute && (
          <Marker
            coordinate={selectedDestination}
            title="Điểm đến"
            description="Vị trí được chọn"
            pinColor={COLORS.PRIMARY}
          >
            <View style={styles.markerContainer}>
              <View style={[styles.markerIcon, {backgroundColor: COLORS.PRIMARY}]}>
                <Ionicons name="flag" size={20} color={COLORS.WHITE} />
              </View>
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
        {shouldShowRoute && directions.coordinates.length > 0 && (
          <Polyline
            coordinates={directions.coordinates}
            strokeWidth={4}
            strokeColor={COLORS.PRIMARY}
            lineDashPattern={[1]}
          />
        )}
      </ReactNativeMap>

      {/* Route Info Card */}
      {shouldShowRoute && (
        <View style={styles.routeInfoCard}>
          <View style={styles.routeInfoRow}>
            <Ionicons name="car-outline" size={20} color={COLORS.PRIMARY} />
            <Text style={styles.routeInfoText}>
              {directions.distance.text} • {directions.duration.text}
            </Text>
          </View>
          {showSelectedRoute && selectedDestination && (
            <Text style={styles.routeInfoSubtext}>Nhấn giữ trên bản đồ để chọn điểm đến khác</Text>
          )}
        </View>
      )}

      {/* Control Buttons */}
      <View style={styles.controls}>
        {/* Clear Route Button */}
        {showSelectedRoute && selectedDestination && (
          <TouchableOpacity
            style={[styles.controlButton, styles.clearRouteButton]}
            onPress={handleClearRoute}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color={COLORS.WHITE} />
          </TouchableOpacity>
        )}

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
        {shouldShowRoute && activeDestination && (
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => fetchDirections(activeDestination)}
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

      {/* Instructions */}
      {!showSelectedRoute && !showRoute && (
        <View style={styles.instructionsCard}>
          <Ionicons name="information-circle-outline" size={20} color={COLORS.PRIMARY} />
          <Text style={styles.instructionsText}>Nhấn giữ trên bản đồ để chọn điểm đến</Text>
        </View>
      )}
    </View>
  );
};

export default MapView;
