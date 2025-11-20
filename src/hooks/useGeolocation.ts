import {useState, useEffect, useCallback} from "react";
import * as Location from "expo-location";

interface Location {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export const useGeolocation = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback(async () => {
    try {
      setLoading(true);
      const {status} = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setError("Permission denied");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const {latitude, longitude, accuracy} = loc.coords;
      setLocation({latitude, longitude, accuracy: accuracy || 0});
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    requestLocation();
  }, []);

  return {location, loading, error, requestLocation};
};
