// src/hooks/useGeolocation.ts
import {useState, useEffect, useCallback} from "react";
import {Platform, Alert} from "react-native";
import * as Location from "expo-location"; // <-- Dùng thư viện này

interface LocationType {
  latitude: number;
  longitude: number;
  accuracy: number | null;
}

export const useGeolocation = () => {
  const [location, setLocation] = useState<LocationType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback(async () => {
    // 1. Xử lý Web (Mock data)
    if (Platform.OS === "web") {
      // Vị trí giả lập (ví dụ: Hà Nội)
      setLocation({latitude: 21.0285, longitude: 105.8542, accuracy: 0});
      setLoading(false);
      setError("Location is mocked on web platform.");
      return;
      return;
    }

    setLoading(true);
    try {
      // 2. Xin quyền truy cập vị trí
      const {status} = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setError("Permission denied");
        Alert.alert("Lỗi", "Cần cấp quyền vị trí để tìm nhà hàng gần bạn.");
        return;
      }

      // 3. Lấy vị trí hiện tại
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High, // Độ chính xác cao
      });

      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        accuracy: loc.coords.accuracy,
      });
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      console.error("Location error:", message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Tự động chạy khi hook được khởi tạo
  useEffect(() => {
    requestLocation();
  }, []);

  return {location, loading, error, requestLocation};
};
