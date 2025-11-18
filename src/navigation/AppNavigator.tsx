import React from "react";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {colors} from "@constants/colors";

// Screens
import HomeScreen from "@screens/home/HomeScreen";
import SearchScreen from "@screens/search/SearchScreen";
import CartScreen from "@screens/cart/CartScreen";
import OrdersScreen from "@screens/orders/OrdersScreen";
import ProfileScreen from "@screens/profile/ProfileScreen";
import RestaurantDetailScreen from "@screens/restaurant/RestaurantDetailScreen";
import ProductDetailScreen from "@screens/product/ProductDetailScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const HomeStack: React.FC = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: true,
      headerStyle: {backgroundColor: colors.primary},
      headerTintColor: "#fff",
      headerTitleStyle: {fontWeight: "bold"},
    }}
  >
    <Stack.Screen name="HomeMain" component={HomeScreen} options={{title: "FunFood"}} />
    <Stack.Screen name="RestaurantDetail" component={RestaurantDetailScreen} options={{title: "Restaurant"}} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{title: "Product"}} />
  </Stack.Navigator>
);

const SearchStack: React.FC = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: true,
      headerStyle: {backgroundColor: colors.primary},
      headerTintColor: "#fff",
    }}
  >
    <Stack.Screen name="SearchMain" component={SearchScreen} options={{title: "Search"}} />
    <Stack.Screen name="RestaurantDetail" component={RestaurantDetailScreen} options={{title: "Restaurant"}} />
  </Stack.Navigator>
);

const CartStack: React.FC = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: true,
      headerStyle: {backgroundColor: colors.primary},
      headerTintColor: "#fff",
    }}
  >
    <Stack.Screen name="CartMain" component={CartScreen} options={{title: "Cart"}} />
  </Stack.Navigator>
);

const OrdersStack: React.FC = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: true,
      headerStyle: {backgroundColor: colors.primary},
      headerTintColor: "#fff",
    }}
  >
    <Stack.Screen name="OrdersMain" component={OrdersScreen} options={{title: "Orders"}} />
  </Stack.Navigator>
);

const ProfileStack: React.FC = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: true,
      headerStyle: {backgroundColor: colors.primary},
      headerTintColor: "#fff",
    }}
  >
    <Stack.Screen name="ProfileMain" component={ProfileScreen} options={{title: "Profile"}} />
  </Stack.Navigator>
);

const AppNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: "#999",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: "#eee",
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabel: route.name,
        tabBarLabelStyle: {fontSize: 12, marginTop: -8},
        tabBarIcon: ({color, size}) => {
          const icons: Record<string, string> = {
            Home: "home",
            Search: "magnify",
            Cart: "shopping",
            Orders: "clipboard-list",
            Profile: "account",
          };
          return <Icon name={icons[route.name]} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Search" component={SearchStack} />
      <Tab.Screen name="Cart" component={CartStack} />
      <Tab.Screen name="Orders" component={OrdersStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
};

export default AppNavigator;
