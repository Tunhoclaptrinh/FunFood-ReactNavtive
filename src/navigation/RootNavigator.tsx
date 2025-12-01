import React, {useEffect, useState} from "react";
import {View, ActivityIndicator, Text, TouchableOpacity, StyleSheet} from "react-native"; // Thêm components
import {NavigationContainer} from "@react-navigation/native";
import {useAuthStore} from "@stores/authStore";
import {useSettingsStore} from "@stores/settingsStore"; // Import Settings
import {navigationRef} from "@services/navigation.service";
import * as LocalAuthentication from "expo-local-authentication"; // Import Sinh trắc học
import {Ionicons} from "@expo/vector-icons"; // Import Icon
import {COLORS} from "../styles/colors";
import AuthNavigator from "./AuthNavigator";
import ShipperNavigator from "./ShipperNavigator";
import MainNavigator from "./MainNavigator";

// ... Import các Navigator (Auth, Main, Shipper)

const RootNavigator = () => {
  const {user, isLoading, isAuthenticated} = useAuthStore();
  const {biometricsEnabled} = useSettingsStore(); // Lấy cài đặt

  // State kiểm soát việc khóa app
  const [isLocked, setIsLocked] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Effect: Kiểm tra khi app khởi động (có user và bật bảo mật)
  useEffect(() => {
    if (isAuthenticated && biometricsEnabled) {
      setIsLocked(true);
      authenticate();
    } else {
      setIsLocked(false);
    }
  }, [isAuthenticated, biometricsEnabled]);

  // Hàm xác thực
  const authenticate = async () => {
    setIsAuthenticating(true);
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        setIsLocked(false); // Không có phần cứng thì bỏ qua
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Xác thực để truy cập FunFood",
        fallbackLabel: "Đăng nhập lại",
        disableDeviceFallback: false,
      });

      if (result.success) {
        setIsLocked(false); // Mở khóa
      } else {
        // Nếu thất bại hoặc hủy, vẫn giữ khóa
        // Có thể thêm nút "Đăng xuất" nếu họ quên vân tay
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Màn hình khóa (Biometric Lock Screen)
  if (isAuthenticated && isLocked) {
    return (
      <View style={styles.lockContainer}>
        <Ionicons name="lock-closed" size={64} color={COLORS.PRIMARY} style={{marginBottom: 24}} />
        <Text style={styles.lockTitle}>FunFood bị khóa</Text>
        <Text style={styles.lockSubtitle}>Vui lòng xác thực để tiếp tục</Text>

        <TouchableOpacity style={styles.unlockButton} onPress={authenticate}>
          <Text style={styles.unlockText}>Mở khóa bằng vân tay/FaceID</Text>
        </TouchableOpacity>

        {/* Nút đăng xuất khẩn cấp nếu không mở được */}
        <TouchableOpacity
          style={{marginTop: 40}}
          onPress={() => {
            useAuthStore.getState().logout();
            setIsLocked(false);
          }}
        >
          <Text style={{color: COLORS.GRAY}}>Đăng xuất / Quên mật khẩu?</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </View>
    );
  }

  // ... (Phần getNavigator giữ nguyên logic cũ)
  const getNavigator = () => {
    if (!isAuthenticated || !user) {
      return <AuthNavigator />;
    }

    switch (user.role) {
      case "shipper":
        return <ShipperNavigator />;
      default:
        return <MainNavigator />;
    }
  };

  return <NavigationContainer ref={navigationRef}>{getNavigator()}</NavigationContainer>;
};

// Styles bổ sung
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.WHITE,
  },
  lockContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.WHITE,
    padding: 20,
  },
  lockTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.DARK,
    marginBottom: 8,
  },
  lockSubtitle: {
    fontSize: 16,
    color: COLORS.GRAY,
    marginBottom: 32,
  },
  unlockButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    width: "80%",
    alignItems: "center",
  },
  unlockText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default RootNavigator;
