/**
 * Shipper Navigator
 * Navigation cho Shipper role
 */

import React from "react";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import {Ionicons} from "@expo/vector-icons";

import ShipperDashboardScreen from "@screens/shipper/ShipperDashboardScreen";
import ShipperAvailableOrdersScreen from "@screens/shipper/ShipperAvailableOrdersScreen";
import ShipperDeliveriesScreen from "@screens/shipper/ShipperDeliveriesScreen";

import ProfileScreen from "@screens/profile/ProfileScreen";

import {COLORS} from "@/src/config/constants";
import ShipperHistoryScreen from "../screens/shipper/ShipperHistoryScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Available Orders Stack
const AvailableOrdersStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: true,
      headerStyle: {backgroundColor: COLORS.WHITE},
      headerTintColor: COLORS.PRIMARY,
      headerTitleStyle: {fontWeight: "700"},
    }}
  >
    <Stack.Screen
      name="ShipperAvailableOrders"
      component={ShipperAvailableOrdersScreen}
      options={{title: "Available Orders", headerBackVisible: false}}
    />
  </Stack.Navigator>
);

// Deliveries Stack
const DeliveriesStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: true,
      headerStyle: {backgroundColor: COLORS.WHITE},
      headerTintColor: COLORS.PRIMARY,
      headerTitleStyle: {fontWeight: "700"},
    }}
  >
    <Stack.Screen
      name="ShipperDeliveries"
      component={ShipperDeliveriesScreen}
      options={{title: "My Deliveries", headerBackVisible: false}}
    />
  </Stack.Navigator>
);

// Dashboard Stack
const DashboardStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="ShipperDashboard" component={ShipperDashboardScreen} options={{title: "Dashboard"}} />
    <Stack.Screen name="ShipperHistory" component={ShipperHistoryScreen} options={{title: "Delivery History"}} />
  </Stack.Navigator>
);

// Profile Stack
const ProfileStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: true,
      headerStyle: {backgroundColor: COLORS.WHITE},
      headerTintColor: COLORS.PRIMARY,
      headerTitleStyle: {fontWeight: "700"},
    }}
  >
    <Stack.Screen
      name="ProfileScreen"
      component={ProfileScreen}
      options={{title: "Profile", headerBackVisible: false}}
    />
  </Stack.Navigator>
);

/**
 * Shipper Main Navigator
 * Bottom tabs: Dashboard, Available Orders, Deliveries, Profile
 */
const ShipperNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarIcon: ({focused, color}) => {
          let iconName: string = "home";

          if (route.name === "Dashboard") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Available") {
            iconName = focused ? "list" : "list-outline";
          } else if (route.name === "Active") {
            iconName = focused ? "car" : "car-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName as any} size={24} color={color} />;
        },
        tabBarActiveTintColor: COLORS.PRIMARY,
        tabBarInactiveTintColor: COLORS.GRAY,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600" as const,
        },
        tabBarStyle: {
          backgroundColor: COLORS.WHITE,
          borderTopWidth: 1,
          borderTopColor: COLORS.LIGHT_GRAY,
          paddingBottom: 2,
          height: 60,
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardStack} options={{tabBarLabel: "Dashboard"}} />
      <Tab.Screen name="Available" component={AvailableOrdersStack} options={{tabBarLabel: "Available"}} />
      <Tab.Screen name="Active" component={DeliveriesStack} options={{tabBarLabel: "Delivering"}} />
      <Tab.Screen name="Profile" component={ProfileStack} options={{tabBarLabel: "Profile"}} />
    </Tab.Navigator>
  );
};

export default ShipperNavigator;
