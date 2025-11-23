/**
 * Root Navigator - Refactored with Navigation Service
 * Role-based navigation routing
 */

import {ActivityIndicator, View} from "react-native";
import {NavigationContainer} from "@react-navigation/native";
import {useAuthStore} from "@stores/authStore";
import {navigationRef} from "@services/navigation.service";

import AuthNavigator from "./AuthNavigator";
import MainNavigator from "./MainNavigator";
import ShipperNavigator from "./ShipperNavigator";
import {COLORS} from "../styles/colors";

const RootNavigator = () => {
  const {user, isLoading, isAuthenticated} = useAuthStore();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: COLORS.WHITE,
        }}
      >
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </View>
    );
  }

  // Determine which navigator to show based on authentication and role
  const getNavigator = () => {
    if (!isAuthenticated || !user) {
      return <AuthNavigator />;
    }

    switch (user.role) {
      case "shipper":
        return <ShipperNavigator />;
      case "customer":
      case "admin":
      case "manager":
      default:
        return <MainNavigator />;
    }
  };

  return <NavigationContainer ref={navigationRef}>{getNavigator()}</NavigationContainer>;
};

export default RootNavigator;
