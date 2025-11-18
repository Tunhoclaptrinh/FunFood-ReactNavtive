import React, {useEffect, useState} from "react";
import {NavigationContainer} from "@react-navigation/native";
import {QueryClientProvider, QueryClient} from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Font from "expo-font";
import {useAuthStore} from "@store/authStore";
import AppNavigator from "@navigation/AppNavigator";
import AuthNavigator from "@navigation/AuthNavigator";
import {View, ActivityIndicator} from "react-native";

// Tạo QueryClient
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
        // 1. Load Fonts cho Ant Design
        await Font.loadAsync({
          antoutline: require("@ant-design/icons-react-native/fonts/antoutline.ttf"),
          antfill: require("@ant-design/icons-react-native/fonts/antfill.ttf"),
        });

        // 2. Khôi phục Token đăng nhập
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
      <NavigationContainer>{isAuthenticated ? <AppNavigator /> : <AuthNavigator />}</NavigationContainer>
    </QueryClientProvider>
  );
};

export default App;
