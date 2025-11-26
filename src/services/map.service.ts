/**
 * Map Service - Google Maps Integration
 * Handles directions, distance calculation, and route drawing
 */

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "";

export interface Location {
  latitude: number;
  longitude: number;
}

export interface DirectionsResult {
  distance: {
    text: string;
    value: number; // meters
  };
  duration: {
    text: string;
    value: number; // seconds
  };
  coordinates: Location[];
  polyline: string;
}

export interface MapMarker {
  id: string;
  coordinate: Location;
  title: string;
  description?: string;
  type: "restaurant" | "delivery" | "current";
  icon?: string;
}

export class MapService {
  /**
   * Get directions from origin to destination using Google Directions API
   */
  static async getDirections(origin: Location, destination: Location): Promise<DirectionsResult | null> {
    try {
      const originStr = `${origin.latitude},${origin.longitude}`;
      const destStr = `${destination.latitude},${destination.longitude}`;

      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destStr}&key=${GOOGLE_MAPS_API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== "OK" || !data.routes || data.routes.length === 0) {
        console.error("Directions API error:", data.status);
        return null;
      }

      const route = data.routes[0];
      const leg = route.legs[0];

      // Decode polyline
      const coordinates = this.decodePolyline(route.overview_polyline.points);

      return {
        distance: leg.distance,
        duration: leg.duration,
        coordinates,
        polyline: route.overview_polyline.points,
      };
    } catch (error) {
      console.error("Error fetching directions:", error);
      return null;
    }
  }

  /**
   * Decode Google Maps polyline string to coordinates
   */
  static decodePolyline(encoded: string): Location[] {
    const coordinates: Location[] = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < encoded.length) {
      let b;
      let shift = 0;
      let result = 0;

      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;

      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      coordinates.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }

    return coordinates;
  }

  /**
   * Calculate distance between two points (Haversine formula)
   */
  static calculateDistance(from: Location, to: Location): number {
    const R = 6371; // Earth radius in km
    const dLat = this.toRad(to.latitude - from.latitude);
    const dLon = this.toRad(to.longitude - from.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(from.latitude)) * Math.cos(this.toRad(to.latitude)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

  /**
   * Convert degrees to radians
   */
  private static toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  /**
   * Format distance for display
   */
  static formatDistance(distanceInKm: number): string {
    if (distanceInKm < 1) {
      return `${Math.round(distanceInKm * 1000)}m`;
    }
    return `${distanceInKm.toFixed(1)}km`;
  }

  /**
   * Format duration for display
   */
  static formatDuration(durationInSeconds: number): string {
    const minutes = Math.round(durationInSeconds / 60);
    if (minutes < 60) {
      return `${minutes} phút`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }

  /**
   * Get map region that fits all markers
   */
  static getRegionForCoordinates(coordinates: Location[]): {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } {
    if (coordinates.length === 0) {
      return {
        latitude: 21.0285,
        longitude: 105.8542,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
    }

    let minLat = coordinates[0].latitude;
    let maxLat = coordinates[0].latitude;
    let minLng = coordinates[0].longitude;
    let maxLng = coordinates[0].longitude;

    coordinates.forEach((coord) => {
      minLat = Math.min(minLat, coord.latitude);
      maxLat = Math.max(maxLat, coord.latitude);
      minLng = Math.min(minLng, coord.longitude);
      maxLng = Math.max(maxLng, coord.longitude);
    });

    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    const latDelta = (maxLat - minLat) * 1.5; // Add padding
    const lngDelta = (maxLng - minLng) * 1.5;

    return {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: Math.max(latDelta, 0.01),
      longitudeDelta: Math.max(lngDelta, 0.01),
    };
  }

  /**
   * Create marker for restaurant
   */
  static createRestaurantMarker(restaurant: any): MapMarker {
    return {
      id: `restaurant-${restaurant.id}`,
      coordinate: {
        latitude: restaurant.latitude,
        longitude: restaurant.longitude,
      },
      title: restaurant.name,
      description: restaurant.address,
      type: "restaurant",
    };
  }

  /**
   * Create marker for delivery location
   */
  static createDeliveryMarker(orderId: number, address: string, location: Location): MapMarker {
    return {
      id: `delivery-${orderId}`,
      coordinate: location,
      title: `Đơn hàng #${orderId}`,
      description: address,
      type: "delivery",
    };
  }

  /**
   * Create marker for current location
   */
  static createCurrentLocationMarker(location: Location): MapMarker {
    return {
      id: "current-location",
      coordinate: location,
      title: "Vị trí của bạn",
      description: "Vị trí hiện tại",
      type: "current",
    };
  }
}
