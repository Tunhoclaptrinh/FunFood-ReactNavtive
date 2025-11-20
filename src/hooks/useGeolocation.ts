import {useState, useEffect, useCallback} from "react";
import {Platform} from "react-native"; // Dòng này RẤT QUAN TRỌNG
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
    // 1. KIỂM TRA NỀN TẢNG: Nếu là Web, sử dụng mock data và thoát
    if (Platform.OS === "web") {
      // Vị trí giả lập (ví dụ: Hà Nội)
      setLocation({latitude: 21.0285, longitude: 105.8542, accuracy: 0});
      setLoading(false);
      setError("Location is mocked on web platform.");
      return;
    }

    // 2. LOGIC NATIVE: Chỉ chạy cho iOS/Android
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
