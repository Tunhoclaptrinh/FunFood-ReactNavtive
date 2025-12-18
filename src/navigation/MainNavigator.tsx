import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import {Ionicons} from "@expo/vector-icons";
import {Image, View, Text, TouchableOpacity} from "react-native";

import {ROUTE_NAMES, SCREEN_OPTIONS} from "@/src/config/routes.config";
import {COLORS} from "@/src/styles/colors";

// Home Stack Screens
import HomeScreen from "@/src/screens/home/HomeScreen";
import RestaurantDetailScreen from "@screens/home/RestaurantDetailScreen";
import ProductDetailScreen from "@screens/home/ProductDetailScreen";

// Search Stack Screens
import SearchScreen from "@screens/search/SearchScreen";

// Cart Stack Screens
import CartScreen from "@screens/cart/CartScreen";
import CheckoutScreen from "@screens/cart/CheckoutScreen";

// Orders Stack Screens
import OrdersScreen from "@/src/screens/orders";
import OrderDetailScreen from "@/src/screens/orders/Detail";

// Profile Stack Screens
import ProfileScreen from "@screens/profile/ProfileScreen";
import EditProfileScreen from "@screens/profile/EditProfileScreen";
import ChangePasswordScreen from "@/src/screens/profile/ChangePasswordScreen";
import AddressListScreen from "@/src/screens/profile/AddressScreen/AddressListScreen";
import FavoritesListScreen from "@screens/profile/FavoritesListScreen";
import MyReviewsScreen from "@screens/profile/MyReviewsScreen";
import NotificationSettingsScreen from "@screens/profile/NotificationSettingsScreen";
import OrderStatsScreen from "@/src/screens/profile/OrderStatsScreen";
import {he} from "date-fns/locale";
import AddAddressScreen from "../screens/profile/AddressScreen/AddAddressScreen";
import SettingsScreen from "../screens/profile/SettingsScreen";
import NotificationsScreen from "../screens/notifications/NotificationsScreen";
import SupportScreen from "../screens/profile/SupportScreen";
import TermsPrivacyScreen from "../screens/profile/TermsPrivacyScreen";
import FaqMissingFoodScreen from "../screens/profile/faqScreen/FaqMissingFoodScreen";
import FaqCancelOrderScreen from "../screens/profile/faqScreen/FaqCancelOrderScreen";
import FaqPaymentIssueScreen from "../screens/profile/faqScreen/FaqPaymentIssueScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/* ==============================
   GLOBAL HEADER WITH LOGO
   ==============================*/
const HeaderLogo = () => (
  <View style={{flexDirection: "row", alignItems: "center"}}>
    <Image
      source={require("@/assets/funfood-logo/logo6.png")}
      style={{width: 80, height: 36, marginRight: 8}}
      resizeMode="contain"
    />
  </View>
);

const GLOBAL_HEADER_OPTIONS = {
  ...SCREEN_OPTIONS.DEFAULT_HEADER,
  headerStyle: {backgroundColor: COLORS.PRIMARY},
  headerTintColor: COLORS.WHITE,
  headerRight: () => <HeaderLogo />,
};

/* ==============================
   CUSTOM BACK BUTTON HELPER
   ==============================*/
const CustomBackHeader = (navigation: any, title?: string) => ({
  headerBackVisible: false,
  headerTitle: title, // ẩn title mặc định => ghi đè bằng title tùy chỉnh
  headerLeft: () => (
    <TouchableOpacity onPress={() => navigation.goBack()} style={{flexDirection: "row", alignItems: "center"}}>
      <Ionicons name="arrow-back" size={24} color={COLORS.WHITE} />
      {/* {title && <Text style={{color: COLORS.WHITE, fontSize: 16, marginLeft: 6}}>{title}</Text>} */}
    </TouchableOpacity>
  ),
});

/* ==============================
   HOME STACK
   ==============================*/
const HomeStack = () => (
  <Stack.Navigator screenOptions={GLOBAL_HEADER_OPTIONS}>
    <Stack.Screen
      name={ROUTE_NAMES.HOME.SCREEN}
      component={HomeScreen}
      options={{title: "Khám phá", headerBackVisible: false}}
    />

    <Stack.Screen
      name={ROUTE_NAMES.COMMON.NOTIFICATIONS}
      component={NotificationsScreen}
      options={({navigation}: any) => CustomBackHeader(navigation, "Thông báo")}
    />
    <Stack.Group screenOptions={SCREEN_OPTIONS.MODAL}>
      <Stack.Screen
        name={ROUTE_NAMES.HOME.RESTAURANT_DETAIL}
        component={RestaurantDetailScreen}
        options={({route, navigation}: any) =>
          CustomBackHeader(navigation, route.params?.restaurantId ? "Thực đơn nhà hàng" : "Thực đơn")
        }
      />
      <Stack.Screen
        name={ROUTE_NAMES.HOME.PRODUCT_DETAIL}
        component={ProductDetailScreen}
        options={({navigation}: any) => CustomBackHeader(navigation, "Chi tiết sản phẩm")}
      />

      <Stack.Screen
        name={ROUTE_NAMES.ORDERS.DETAIL}
        component={OrderDetailScreen}
        options={({route, navigation}: any) => CustomBackHeader(navigation, `Đơn hàng #${route.params?.orderId}`)}
      />
    </Stack.Group>
  </Stack.Navigator>
);

/* ==============================
   SEARCH STACK
   ==============================*/
const SearchStack = () => (
  <Stack.Navigator screenOptions={GLOBAL_HEADER_OPTIONS}>
    <Stack.Screen
      name={ROUTE_NAMES.SEARCH.SCREEN}
      component={SearchScreen}
      options={{title: "Tìm kiếm", headerBackVisible: false}}
    />
    <Stack.Group screenOptions={SCREEN_OPTIONS.MODAL}>
      <Stack.Screen
        name={ROUTE_NAMES.SEARCH.RESTAURANT_DETAIL}
        component={RestaurantDetailScreen}
        options={({navigation}: any) => CustomBackHeader(navigation, "Thực đơn nhà hàng")}
      />
      <Stack.Screen
        name={ROUTE_NAMES.SEARCH.PRODUCT_DETAIL}
        component={ProductDetailScreen}
        options={({navigation}: any) => CustomBackHeader(navigation, "Chi tiết sản phẩm")}
      />
    </Stack.Group>
  </Stack.Navigator>
);

/* ==============================
   CART STACK
   ==============================*/
const CartStack = () => (
  <Stack.Navigator screenOptions={GLOBAL_HEADER_OPTIONS}>
    <Stack.Screen
      name={ROUTE_NAMES.CART.SCREEN}
      component={CartScreen}
      options={{title: "Giỏ hàng", headerBackVisible: false}}
    />
    <Stack.Screen
      name={ROUTE_NAMES.CART.CHECKOUT}
      component={CheckoutScreen}
      options={({navigation}: any) => CustomBackHeader(navigation, "Thanh toán")}
    />
    <Stack.Screen
      name={ROUTE_NAMES.ORDERS.SCREEN}
      component={OrdersScreen}
      options={({navigation}: any) => CustomBackHeader(navigation, "Đơn của tôi")}
    />
    <Stack.Screen
      name={ROUTE_NAMES.PROFILE.ADDRESS_LIST}
      component={AddressListScreen}
      options={({navigation}: any) => CustomBackHeader(navigation, "Địa chỉ giao hàng")}
    />
  </Stack.Navigator>
);

/* ==============================
   ORDERS STACK
   ==============================*/
const OrdersStack = () => (
  <Stack.Navigator screenOptions={GLOBAL_HEADER_OPTIONS}>
    <Stack.Screen
      name={ROUTE_NAMES.ORDERS.SCREEN}
      component={OrdersScreen}
      options={{title: "Đơn của tôi", headerBackVisible: false}}
    />
    <Stack.Screen
      name={ROUTE_NAMES.ORDERS.DETAIL}
      component={OrderDetailScreen}
      options={({route, navigation}: any) => CustomBackHeader(navigation, `Đơn hàng #${route.params?.orderId}`)}
    />
  </Stack.Navigator>
);

/* ==============================
   PROFILE STACK
   ==============================*/
const ProfileStack = () => (
  <Stack.Navigator screenOptions={GLOBAL_HEADER_OPTIONS}>
    <Stack.Screen
      name={ROUTE_NAMES.PROFILE.SCREEN}
      component={ProfileScreen}
      options={{title: "Hồ sơ", headerBackVisible: false}}
    />
    <Stack.Screen
      name={ROUTE_NAMES.COMMON.NOTIFICATIONS}
      component={NotificationsScreen}
      options={({navigation}: any) => CustomBackHeader(navigation, "Thông báo")}
    />
    <Stack.Screen
      name={ROUTE_NAMES.PROFILE.EDIT_PROFILE}
      component={EditProfileScreen}
      options={({navigation}: any) => CustomBackHeader(navigation, "Chỉnh sửa hồ sơ")}
    />
    <Stack.Screen
      name={ROUTE_NAMES.PROFILE.CHANGE_PASSWORD}
      component={ChangePasswordScreen}
      options={({navigation}: any) => CustomBackHeader(navigation, "Đổi mật khẩu")}
    />
    <Stack.Screen
      name={ROUTE_NAMES.PROFILE.ADDRESS_LIST}
      component={AddressListScreen}
      options={({navigation}: any) => CustomBackHeader(navigation, "Địa chỉ giao hàng")}
    />
    <Stack.Screen
      name={ROUTE_NAMES.PROFILE.ADD_ADDRESS}
      component={AddAddressScreen}
      options={({route, navigation}: any) =>
        CustomBackHeader(navigation, route.params?.address ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ")
      }
    />
    <Stack.Screen
      name={ROUTE_NAMES.PROFILE.FAVORITES_LIST}
      component={FavoritesListScreen}
      options={({navigation}: any) => CustomBackHeader(navigation, "Yêu thích")}
    />
    <Stack.Screen
      name={ROUTE_NAMES.PROFILE.MY_REVIEWS}
      component={MyReviewsScreen}
      options={({navigation}: any) => CustomBackHeader(navigation, "Đánh giá của tôi")}
    />
    <Stack.Screen
      name={ROUTE_NAMES.PROFILE.NOTIFICATION_SETTINGS}
      component={NotificationSettingsScreen}
      options={({navigation}: any) => CustomBackHeader(navigation, "Cài đặt thông báo")}
    />
    <Stack.Screen
      name={ROUTE_NAMES.PROFILE.ORDER_STATS}
      component={OrderStatsScreen}
      options={({navigation}: any) => CustomBackHeader(navigation, "Thống kê đơn hàng")}
    />

    <Stack.Screen
      name={ROUTE_NAMES.PROFILE.SUPPORT}
      component={SupportScreen}
      options={{title: "Trợ giúp", headerBackVisible: false}}
    />
    <Stack.Screen
      name={ROUTE_NAMES.PROFILE.TERMS_PRIVACY}
      component={TermsPrivacyScreen}
      options={{title: "Điều khoản", headerBackVisible: false}}
    />
    <Stack.Screen
      name={ROUTE_NAMES.ORDERS.DETAIL}
      component={OrderDetailScreen}
      options={({route, navigation}: any) => CustomBackHeader(navigation, `Đơn hàng #${route.params?.orderId}`)}
    />
    <Stack.Group screenOptions={SCREEN_OPTIONS.MODAL}>
      <Stack.Screen
        name={ROUTE_NAMES.HOME.RESTAURANT_DETAIL}
        component={RestaurantDetailScreen}
        options={({navigation}: any) => CustomBackHeader(navigation, "Thực đơn nhà hàng")}
      />
      <Stack.Screen
        name={ROUTE_NAMES.HOME.PRODUCT_DETAIL}
        component={ProductDetailScreen}
        options={({navigation}: any) => CustomBackHeader(navigation, "Chi tiết sản phẩm")}
      />
    </Stack.Group>
    <Stack.Screen
      name={ROUTE_NAMES.COMMON.SETTINGS}
      component={SettingsScreen}
      options={({navigation}: any) => CustomBackHeader(navigation, "Cài đặt")}
    />
    <Stack.Screen
      name="FaqMissingFood"
      component={FaqMissingFoodScreen}
      options={({navigation}: any) => CustomBackHeader(navigation, "Đơn hàng thiếu món")}
    />
    <Stack.Screen
      name="FaqCancelOrder"
      component={FaqCancelOrderScreen}
      options={({navigation}: any) => CustomBackHeader(navigation, "Cách hủy đơn hàng")}
    />
    <Stack.Screen
      name="FaqPaymentIssue"
      component={FaqPaymentIssueScreen}
      options={({navigation}: any) => CustomBackHeader(navigation, "Lỗi thanh toán")}
    />
  </Stack.Navigator>
);
/* ==============================
   MAIN TAB NAVIGATOR
   ==============================*/
const MainNavigator = () => (
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
      tabBarLabelStyle: {fontSize: 11, fontWeight: "600"},
      tabBarStyle: {
        backgroundColor: COLORS.WHITE,
        borderTopWidth: 1,
        borderTopColor: COLORS.LIGHT_GRAY,
        paddingBottom: 2,
        height: 60,
      },
    })}
  >
    <Tab.Screen name={ROUTE_NAMES.TABS.HOME} component={HomeStack} options={{tabBarLabel: "Trang chủ"}} />
    <Tab.Screen name={ROUTE_NAMES.TABS.SEARCH} component={SearchStack} options={{tabBarLabel: "Tìm kiếm"}} />
    <Tab.Screen name={ROUTE_NAMES.TABS.CART} component={CartStack} options={{tabBarLabel: "Giỏ hàng"}} />
    <Tab.Screen name={ROUTE_NAMES.TABS.ORDERS} component={OrdersStack} options={{tabBarLabel: "Đơn hàng"}} />
    <Tab.Screen name={ROUTE_NAMES.TABS.PROFILE} component={ProfileStack} options={{tabBarLabel: "Tài khoản"}} />
  </Tab.Navigator>
);

export default MainNavigator;
