import React from "react";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import {Ionicons} from "@expo/vector-icons";

import HomeScreen from "@screens/home/HomeScreen";
import SearchScreen from "@screens/search/SearchScreen";
import CartScreen from "@screens/cart/CartScreen";
import OrdersScreen from "@screens/orders/OrdersScreen";
import ProfileScreen from "@screens/profile/ProfileScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const HomeStack = () => (
  <Stack.Navigator screenOptions={{headerShown: true}}>
    <Stack.Screen name="HomeScreen" component={HomeScreen} options={{title: "Home"}} />
  </Stack.Navigator>
);

const SearchStack = () => (
  <Stack.Navigator screenOptions={{headerShown: true}}>
    <Stack.Screen name="SearchScreen" component={SearchScreen} options={{title: "Search"}} />
  </Stack.Navigator>
);

const CartStack = () => (
  <Stack.Navigator screenOptions={{headerShown: true}}>
    <Stack.Screen name="CartScreen" component={CartScreen} options={{title: "Cart"}} />
  </Stack.Navigator>
);

const OrdersStack = () => (
  <Stack.Navigator screenOptions={{headerShown: true}}>
    <Stack.Screen name="OrdersScreen" component={OrdersScreen} options={{title: "Orders"}} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator screenOptions={{headerShown: true}}>
    <Stack.Screen name="ProfileScreen" component={ProfileScreen} options={{title: "Profile"}} />
  </Stack.Navigator>
);

const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarIcon: ({focused, color, size}) => {
          let iconName: string = "home";

          if (route.name === "Home") iconName = focused ? "home" : "home-outline";
          else if (route.name === "Search") iconName = focused ? "search" : "search-outline";
          else if (route.name === "Cart") iconName = focused ? "cart" : "cart-outline";
          else if (route.name === "Orders") iconName = focused ? "list" : "list-outline";
          else if (route.name === "Profile") iconName = focused ? "person" : "person-outline";

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#FF6B6B",
        tabBarInactiveTintColor: "#8B8B8B",
        tabBarLabelStyle: {fontSize: 12},
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} options={{tabBarLabel: "Home"}} />
      <Tab.Screen name="Search" component={SearchStack} options={{tabBarLabel: "Search"}} />
      <Tab.Screen name="Cart" component={CartStack} options={{tabBarLabel: "Cart"}} />
      <Tab.Screen name="Orders" component={OrdersStack} options={{tabBarLabel: "Orders"}} />
      <Tab.Screen name="Profile" component={ProfileStack} options={{tabBarLabel: "Profile"}} />
    </Tab.Navigator>
  );
};

export default MainNavigator;
