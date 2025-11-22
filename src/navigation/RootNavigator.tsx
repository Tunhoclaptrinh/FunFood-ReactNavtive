/**
 * Root Navigator - Role-Based Navigation
 * Xử lý routing dựa trên user role
 *
 * Routes:
 * 1. AuthNavigator - Before login
 * 2. MainNavigator - Customer role
 * 3. ShipperNavigator - Shipper role
 */

import React from "react";
import {ActivityIndicator, View} from "react-native";
import {NavigationContainer} from "@react-navigation/native";
import {useAuthStore} from "@stores/authStore";
import AuthNavigator from "./AuthNavigator";
import MainNavigator from "./MainNavigator";
import ShipperNavigator from "./ShipperNavigator";
import {COLORS} from "@/src/config/constants";

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

  return (
    <NavigationContainer>
      {!isAuthenticated || !user ? (
        // Auth Flow
        <AuthNavigator />
      ) : user.role === "shipper" ? (
        // Shipper Flow
        <ShipperNavigator />
      ) : (
        // Customer Flow (default)
        <MainNavigator />
      )}
    </NavigationContainer>
  );
};

export default RootNavigator;
