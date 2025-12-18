/**
 * Shipper Navigator - FIXED & COMPLETE
 * Navigation cho Shipper role với proper structure
 */

import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import {Ionicons} from "@expo/vector-icons";
import {TouchableOpacity} from "react-native";

import ShipperDashboardScreen from "@screens/shipper/ShipperDashboardScreen";
import ShipperAvailableOrdersScreen from "@screens/shipper/ShipperAvailableOrdersScreen";
import ShipperDeliveriesScreen from "@screens/shipper/ShipperDeliveriesScreen";
import ShipperHistoryScreen from "@screens/shipper/ShipperHistoryScreen";
import ProfileScreen from "@screens/profile/ProfileScreen";
import EditProfileScreen from "@screens/profile/EditProfileScreen";
import ChangePasswordScreen from "@screens/profile/ChangePasswordScreen";
import AddressListScreen from "@screens/profile/AddressScreen/AddressListScreen";
import AddAddressScreen from "@screens/profile/AddressScreen/AddAddressScreen";
import FavoritesListScreen from "@screens/profile/FavoritesListScreen";
import MyReviewsScreen from "@screens/profile/MyReviewsScreen";
import NotificationSettingsScreen from "@screens/profile/NotificationSettingsScreen";
import OrderStatsScreen from "@screens/profile/OrderStatsScreen";
import SupportScreen from "@screens/profile/SupportScreen";
import TermsPrivacyScreen from "@screens/profile/TermsPrivacyScreen";
import SettingsScreen from "@screens/profile/SettingsScreen";

import {COLORS} from "@/src/styles/colors";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const HEADER_STYLE = {
  headerShown: true,
  headerStyle: {backgroundColor: COLORS.PRIMARY},
  headerTintColor: COLORS.WHITE,
  headerTitleStyle: {fontWeight: "700" as const},
};

/**
 * Custom Back Button Component
 */
const CustomBackButton = ({navigation, title}: any) => ({
  headerBackVisible: false,
  headerTitle: title,
  headerLeft: () => (
    <TouchableOpacity
      onPress={() => navigation.goBack()}
      style={{flexDirection: "row", alignItems: "center", paddingLeft: 8}}
    >
      <Ionicons name="arrow-back" size={24} color={COLORS.WHITE} />
    </TouchableOpacity>
  ),
});

/**
 * Dashboard Stack - Contains Dashboard + History
 */
const DashboardStack = () => (
  <Stack.Navigator screenOptions={HEADER_STYLE}>
    <Stack.Screen
      name="ShipperDashboardMain"
      component={ShipperDashboardScreen}
      options={{title: "Dashboard", headerBackVisible: false}}
    />
    <Stack.Screen
      name="ShipperHistory"
      component={ShipperHistoryScreen}
      options={({navigation}) => CustomBackButton(navigation, "Delivery History")}
    />
  </Stack.Navigator>
);

/**
 * Available Orders Stack
 */
const AvailableOrdersStack = () => (
  <Stack.Navigator screenOptions={HEADER_STYLE}>
    <Stack.Screen
      name="ShipperAvailableOrdersMain"
      component={ShipperAvailableOrdersScreen}
      options={{title: "Available Orders", headerBackVisible: false}}
    />
  </Stack.Navigator>
);

/**
 * Active Deliveries Stack
 */
const DeliveriesStack = () => (
  <Stack.Navigator screenOptions={HEADER_STYLE}>
    <Stack.Screen
      name="ShipperDeliveriesMain"
      component={ShipperDeliveriesScreen}
      options={{title: "My Deliveries", headerBackVisible: false}}
    />
  </Stack.Navigator>
);

/**
 * Profile Stack - Shared with Customer
 */
const ProfileStack = () => (
  <Stack.Navigator screenOptions={HEADER_STYLE}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} options={{title: "Profile", headerBackVisible: false}} />

    {/* Profile Management */}
    <Stack.Screen
      name="EditProfile"
      component={EditProfileScreen}
      options={({navigation}) => CustomBackButton(navigation, "Edit Profile")}
    />
    <Stack.Screen
      name="ChangePassword"
      component={ChangePasswordScreen}
      options={({navigation}) => CustomBackButton(navigation, "Change Password")}
    />

    {/* Address Management */}
    <Stack.Screen
      name="AddressList"
      component={AddressListScreen}
      options={({navigation}) => CustomBackButton(navigation, "My Addresses")}
    />
    <Stack.Screen
      name="AddAddress"
      component={AddAddressScreen}
      options={({navigation, route}: any) =>
        CustomBackButton(navigation, route.params?.address ? "Edit Address" : "Add Address")
      }
    />

    {/* Favorites & Reviews */}
    <Stack.Screen
      name="FavoritesList"
      component={FavoritesListScreen}
      options={({navigation}) => CustomBackButton(navigation, "Favorites")}
    />
    <Stack.Screen
      name="MyReviews"
      component={MyReviewsScreen}
      options={({navigation}) => CustomBackButton(navigation, "My Reviews")}
    />

    {/* Settings */}
    <Stack.Screen
      name="Settings"
      component={SettingsScreen}
      options={({navigation}) => CustomBackButton(navigation, "Settings")}
    />
    <Stack.Screen
      name="NotificationSettings"
      component={NotificationSettingsScreen}
      options={({navigation}) => CustomBackButton(navigation, "Notifications")}
    />

    {/* Shipper-specific: Delivery History */}
    <Stack.Screen
      name="ShipperHistoryDelivery"
      component={ShipperHistoryScreen}
      options={({navigation}) => CustomBackButton(navigation, "Delivery History")}
    />

    {/* Stats & Support */}
    <Stack.Screen
      name="OrderStats"
      component={OrderStatsScreen}
      options={({navigation}) => CustomBackButton(navigation, "Statistics")}
    />
    <Stack.Screen
      name="Support"
      component={SupportScreen}
      options={({navigation}) => CustomBackButton(navigation, "Help & Support")}
    />
    <Stack.Screen
      name="TermsPrivacy"
      component={TermsPrivacyScreen}
      options={({navigation}) => CustomBackButton(navigation, "Terms & Privacy")}
    />
  </Stack.Navigator>
);

/**
 * Main Shipper Navigator
 * Bottom tabs: Dashboard, Available Orders, Active Deliveries, Profile
 */
const ShipperNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarIcon: ({focused, color}) => {
          let iconName: string = "home";

          switch (route.name) {
            case "Dashboard":
              iconName = focused ? "home" : "home-outline";
              break;
            case "Available":
              iconName = focused ? "list" : "list-outline";
              break;
            case "Active":
              iconName = focused ? "car" : "car-outline";
              break;
            case "Profile":
              iconName = focused ? "person" : "person-outline";
              break;
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
