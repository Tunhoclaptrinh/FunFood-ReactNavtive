import React, {useEffect, useState} from "react";
import {NavigationContainer} from "@react-navigation/native";
import {QueryClientProvider, QueryClient} from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import * as Font from "expo-font"; // Không cần thiết nếu không dùng font tùy chỉnh khác ngay lập tức
import {useAuthStore} from "@store/authStore";
import AppNavigator from "@navigation/AppNavigator";
import AuthNavigator from "@navigation/AuthNavigator";
import {View, ActivityIndicator, StatusBar} from "react-native"; // Dùng ActivityIndicator thay vì Spin

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
  },
});

const App: React.FC = () => {
  const {isAuthenticated, setAuth} = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      try {
        // Đã xóa phần load font Ant Design gây lỗi

        // Khôi phục Token đăng nhập
        const token = await AsyncStorage.getItem("authToken");
        const userJson = await AsyncStorage.getItem("user");

        if (token && userJson) {
          const user = JSON.parse(userJson);
          setAuth(user, token);
        }
      } catch (error) {
        console.error("Failed to prepare app:", error);
      } finally {
        setIsReady(true);
      }
    };

    prepare();
  }, []);

  if (!isReady) {
    return (
      <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar barStyle="dark-content" />
      <NavigationContainer>{isAuthenticated ? <AppNavigator /> : <AuthNavigator />}</NavigationContainer>
    </QueryClientProvider>
  );
};

export default App;
