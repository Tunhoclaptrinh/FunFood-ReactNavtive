import React, {useEffect} from "react";
import {NavigationContainer} from "@react-navigation/native";
import {QueryClientProvider, QueryClient} from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useAuthStore} from "@store/authStore";
import AppNavigator from "@navigation/AppNavigator";
import AuthNavigator from "@navigation/AuthNavigator";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
  },
});

const App: React.FC = () => {
  const {isAuthenticated, setAuth, logout} = useAuthStore();
  const [initializing, setInitializing] = React.useState(true);

  useEffect(() => {
    const restoreToken = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const userJson = await AsyncStorage.getItem("user");

        if (token && userJson) {
          const user = JSON.parse(userJson);
          setAuth(user, token);
        }
      } catch (error) {
        console.error("Failed to restore token:", error);
      } finally {
        setInitializing(false);
      }
    };

    restoreToken();
  }, []);

  if (initializing) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>{isAuthenticated ? <AppNavigator /> : <AuthNavigator />}</NavigationContainer>
    </QueryClientProvider>
  );
};

export default App;
