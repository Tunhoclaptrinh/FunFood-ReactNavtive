import React from "react";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import {Ionicons} from "@expo/vector-icons";

import HomeScreen from "@screens/home/HomeScreen";
import RestaurantDetailScreen from "@screens/home/RestaurantDetailScreen";
import ProductDetailScreen from "@screens/home/ProductDetailScreen";

import SearchScreen from "@screens/search/SearchScreen";

import CartScreen from "@screens/cart/CartScreen";
import CheckoutScreen from "@screens/cart/CheckoutScreen";

import OrdersScreen from "@screens/orders/OrdersScreen";
import OrderDetailScreen from "@screens/orders/OrderDetailScreen";

import ProfileScreen from "@screens/profile/ProfileScreen";

import {COLORS} from "@/src/config/constants";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Home Stack
const HomeStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: true,
      headerStyle: {
        backgroundColor: COLORS.WHITE,
      },
      headerTintColor: COLORS.PRIMARY,
      headerTitleStyle: {
        fontWeight: "700" as const,
      },
    }}
  >
    <Stack.Screen name="HomeScreen" component={HomeScreen} options={{title: "FunFood", headerBackVisible: false}} />
    <Stack.Group screenOptions={{presentation: "modal"}}>
      <Stack.Screen
        name="RestaurantDetail"
        component={RestaurantDetailScreen}
        options={({route}: any) => ({
          title: route.params?.restaurantId ? "Restaurant Menu" : "Menu",
        })}
      />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{title: "Product Details"}} />
    </Stack.Group>
  </Stack.Navigator>
);

// Search Stack
const SearchStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: true,
      headerStyle: {
        backgroundColor: COLORS.WHITE,
      },
      headerTintColor: COLORS.PRIMARY,
      headerTitleStyle: {
        fontWeight: "700" as const,
      },
    }}
  >
    <Stack.Screen name="SearchScreen" component={SearchScreen} options={{title: "Search", headerBackVisible: false}} />
    <Stack.Group screenOptions={{presentation: "modal"}}>
      <Stack.Screen name="RestaurantDetail" component={RestaurantDetailScreen} options={{title: "Restaurant Menu"}} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{title: "Product Details"}} />
    </Stack.Group>
  </Stack.Navigator>
);

// Cart Stack
const CartStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: true,
      headerStyle: {
        backgroundColor: COLORS.WHITE,
      },
      headerTintColor: COLORS.PRIMARY,
      headerTitleStyle: {
        fontWeight: "700" as const,
      },
    }}
  >
    <Stack.Screen
      name="CartScreen"
      component={CartScreen}
      options={{title: "Shopping Cart", headerBackVisible: false}}
    />
    <Stack.Screen name="Checkout" component={CheckoutScreen} options={{title: "Checkout"}} />
  </Stack.Navigator>
);

// Orders Stack
const OrdersStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: true,
      headerStyle: {
        backgroundColor: COLORS.WHITE,
      },
      headerTintColor: COLORS.PRIMARY,
      headerTitleStyle: {
        fontWeight: "700" as const,
      },
    }}
  >
    <Stack.Screen
      name="OrdersScreen"
      component={OrdersScreen}
      options={{title: "My Orders", headerBackVisible: false}}
    />
    <Stack.Screen
      name="OrderDetail"
      component={OrderDetailScreen}
      options={({route}: any) => ({
        title: `Order #${route.params?.orderId}`,
      })}
    />
  </Stack.Navigator>
);

// Profile Stack
const ProfileStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: true,
      headerStyle: {
        backgroundColor: COLORS.WHITE,
      },
      headerTintColor: COLORS.PRIMARY,
      headerTitleStyle: {
        fontWeight: "700" as const,
      },
    }}
  >
    <Stack.Screen
      name="ProfileScreen"
      component={ProfileScreen}
      options={{title: "Profile", headerBackVisible: false}}
    />
  </Stack.Navigator>
);

const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarIcon: ({focused, color, size}) => {
          let iconName: string = "home";

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Search") {
            iconName = focused ? "search" : "search-outline";
          } else if (route.name === "Cart") {
            iconName = focused ? "cart" : "cart-outline";
          } else if (route.name === "Orders") {
            iconName = focused ? "list" : "list-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
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
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarLabel: "Home",
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchStack}
        options={{
          tabBarLabel: "Search",
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartStack}
        options={{
          tabBarLabel: "Cart",
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersStack}
        options={{
          tabBarLabel: "Orders",
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarLabel: "Profile",
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
