/**
 * Main Navigator - Refactored with Routes Config
 */

import React from "react";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import {Ionicons} from "@expo/vector-icons";

import {ROUTE_NAMES, SCREEN_OPTIONS} from "@/src/config/routes.config";
import {COLORS} from "@/src/config/constants";

// Home Stack Screens
import HomeScreen from "@screens/home/HomeScreen";
import RestaurantDetailScreen from "@screens/home/RestaurantDetailScreen";
import ProductDetailScreen from "@screens/home/ProductDetailScreen";

// Search Stack Screens
import SearchScreen from "@screens/search/SearchScreen";

// Cart Stack Screens
import CartScreen from "@screens/cart/CartScreen";
import CheckoutScreen from "@screens/cart/CheckoutScreen";

// Orders Stack Screens
import OrdersScreen from "@screens/orders/OrdersScreen";
import OrderDetailScreen from "@screens/orders/OrderDetailScreen";

// Profile Stack Screens
import ProfileScreen from "@screens/profile/ProfileScreen";
import EditProfileScreen from "@screens/profile/EditProfileScreen";
import ChangePasswordScreen from "@screens/profile/ChangePasswordScreen";
import AddressListScreen from "@screens/profile/AddressListScreen";
import AddAddressScreen from "@screens/profile/AddAddressScreen";
import FavoritesListScreen from "@screens/profile/FavoritesListScreen";
import MyReviewsScreen from "@screens/profile/MyReviewsScreen";
import NotificationSettingsScreen from "@screens/profile/NotificationSettingsScreen";
import OrderStatsScreen from "@screens/profile/OrderStatsScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Home Stack Navigator
const HomeStack = () => (
  <Stack.Navigator screenOptions={SCREEN_OPTIONS.DEFAULT_HEADER}>
    <Stack.Screen
      name={ROUTE_NAMES.HOME.SCREEN}
      component={HomeScreen}
      options={{title: "FunFood", headerBackVisible: false}}
    />
    <Stack.Group screenOptions={SCREEN_OPTIONS.MODAL}>
      <Stack.Screen
        name={ROUTE_NAMES.HOME.RESTAURANT_DETAIL}
        component={RestaurantDetailScreen}
        options={({route}: any) => ({
          title: route.params?.restaurantId ? "Restaurant Menu" : "Menu",
        })}
      />
      <Stack.Screen
        name={ROUTE_NAMES.HOME.PRODUCT_DETAIL}
        component={ProductDetailScreen}
        options={{title: "Product Details"}}
      />
    </Stack.Group>
  </Stack.Navigator>
);

// Search Stack Navigator
const SearchStack = () => (
  <Stack.Navigator screenOptions={SCREEN_OPTIONS.DEFAULT_HEADER}>
    <Stack.Screen
      name={ROUTE_NAMES.SEARCH.SCREEN}
      component={SearchScreen}
      options={{title: "Search", headerBackVisible: false}}
    />
    <Stack.Group screenOptions={SCREEN_OPTIONS.MODAL}>
      <Stack.Screen
        name={ROUTE_NAMES.SEARCH.RESTAURANT_DETAIL}
        component={RestaurantDetailScreen}
        options={{title: "Restaurant Menu"}}
      />
      <Stack.Screen
        name={ROUTE_NAMES.SEARCH.PRODUCT_DETAIL}
        component={ProductDetailScreen}
        options={{title: "Product Details"}}
      />
    </Stack.Group>
  </Stack.Navigator>
);

// Cart Stack Navigator
const CartStack = () => (
  <Stack.Navigator screenOptions={SCREEN_OPTIONS.DEFAULT_HEADER}>
    <Stack.Screen
      name={ROUTE_NAMES.CART.SCREEN}
      component={CartScreen}
      options={{title: "Shopping Cart", headerBackVisible: false}}
    />
    <Stack.Screen name={ROUTE_NAMES.CART.CHECKOUT} component={CheckoutScreen} options={{title: "Checkout"}} />
  </Stack.Navigator>
);

// Orders Stack Navigator
const OrdersStack = () => (
  <Stack.Navigator screenOptions={SCREEN_OPTIONS.DEFAULT_HEADER}>
    <Stack.Screen
      name={ROUTE_NAMES.ORDERS.SCREEN}
      component={OrdersScreen}
      options={{title: "My Orders", headerBackVisible: false}}
    />
    <Stack.Screen
      name={ROUTE_NAMES.ORDERS.DETAIL}
      component={OrderDetailScreen}
      options={({route}: any) => ({
        title: `Order #${route.params?.orderId}`,
      })}
    />
  </Stack.Navigator>
);

// Profile Stack Navigator
const ProfileStack = () => (
  <Stack.Navigator screenOptions={SCREEN_OPTIONS.DEFAULT_HEADER}>
    <Stack.Screen
      name={ROUTE_NAMES.PROFILE.SCREEN}
      component={ProfileScreen}
      options={{title: "Profile", headerBackVisible: false}}
    />
    <Stack.Screen
      name={ROUTE_NAMES.PROFILE.EDIT_PROFILE}
      component={EditProfileScreen}
      options={{title: "Edit Profile"}}
    />
    <Stack.Screen
      name={ROUTE_NAMES.PROFILE.CHANGE_PASSWORD}
      component={ChangePasswordScreen}
      options={{title: "Change Password"}}
    />
    <Stack.Screen
      name={ROUTE_NAMES.PROFILE.ADDRESS_LIST}
      component={AddressListScreen}
      options={{title: "Delivery Addresses"}}
    />
    <Stack.Screen
      name={ROUTE_NAMES.PROFILE.ADD_ADDRESS}
      component={AddAddressScreen}
      options={({route}: any) => ({
        title: route.params?.address ? "Edit Address" : "Add Address",
      })}
    />
    <Stack.Screen
      name={ROUTE_NAMES.PROFILE.FAVORITES_LIST}
      component={FavoritesListScreen}
      options={{title: "My Favorites"}}
    />
    <Stack.Screen name={ROUTE_NAMES.PROFILE.MY_REVIEWS} component={MyReviewsScreen} options={{title: "My Reviews"}} />
    <Stack.Screen
      name={ROUTE_NAMES.PROFILE.NOTIFICATION_SETTINGS}
      component={NotificationSettingsScreen}
      options={{title: "Notification Settings"}}
    />
    <Stack.Screen
      name={ROUTE_NAMES.PROFILE.ORDER_STATS}
      component={OrderStatsScreen}
      options={{title: "Order Statistics"}}
    />
  </Stack.Navigator>
);

// Main Tab Navigator
const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarIcon: ({focused, color, size}) => {
          const iconMap = SCREEN_OPTIONS.TAB_ICONS;
          let iconName: string;

          switch (route.name) {
            case ROUTE_NAMES.TABS.HOME:
              iconName = focused ? iconMap.HOME.focused : iconMap.HOME.unfocused;
              break;
            case ROUTE_NAMES.TABS.SEARCH:
              iconName = focused ? iconMap.SEARCH.focused : iconMap.SEARCH.unfocused;
              break;
            case ROUTE_NAMES.TABS.CART:
              iconName = focused ? iconMap.CART.focused : iconMap.CART.unfocused;
              break;
            case ROUTE_NAMES.TABS.ORDERS:
              iconName = focused ? iconMap.ORDERS.focused : iconMap.ORDERS.unfocused;
              break;
            case ROUTE_NAMES.TABS.PROFILE:
              iconName = focused ? iconMap.PROFILE.focused : iconMap.PROFILE.unfocused;
              break;
            default:
              iconName = "help-outline";
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.PRIMARY,
        tabBarInactiveTintColor: COLORS.GRAY,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
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
      <Tab.Screen name={ROUTE_NAMES.TABS.HOME} component={HomeStack} options={{tabBarLabel: "Home"}} />
      <Tab.Screen name={ROUTE_NAMES.TABS.SEARCH} component={SearchStack} options={{tabBarLabel: "Search"}} />
      <Tab.Screen name={ROUTE_NAMES.TABS.CART} component={CartStack} options={{tabBarLabel: "Cart"}} />
      <Tab.Screen name={ROUTE_NAMES.TABS.ORDERS} component={OrdersStack} options={{tabBarLabel: "Orders"}} />
      <Tab.Screen name={ROUTE_NAMES.TABS.PROFILE} component={ProfileStack} options={{tabBarLabel: "Profile"}} />
    </Tab.Navigator>
  );
};

export default MainNavigator;
