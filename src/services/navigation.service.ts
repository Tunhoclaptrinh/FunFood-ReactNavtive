import {createNavigationContainerRef} from "@react-navigation/native";
import type {RouteParams} from "@/src/config/routes.config";

export const navigationRef = createNavigationContainerRef<RouteParams>();

export function navigate<RouteName extends keyof RouteParams>(name: RouteName, params?: RouteParams[RouteName]) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as any, params as any);
  }
}

export function goBack() {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
}

export function reset(routeName: keyof RouteParams) {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{name: routeName as any}],
    });
  }
}

export function replace<RouteName extends keyof RouteParams>(name: RouteName, params?: RouteParams[RouteName]) {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{name: name as any, params: params as any}],
    });
  }
}

export const NavigationService = {
  // Auth flow
  toLogin: () => navigate("Login"),
  toRegister: () => navigate("Register"),

  // Home flow
  toHome: () => navigate("HomeScreen"),
  toRestaurantDetail: (restaurantId: number) => navigate("RestaurantDetail", {restaurantId}),
  toProductDetail: (productId: number) => navigate("ProductDetail", {productId}),

  // Search flow
  toSearch: () => navigate("SearchScreen"),

  // Cart flow
  toCart: () => navigate("CartScreen"),
  toCheckout: () => navigate("Checkout"),

  // Orders flow
  toOrders: () => navigate("OrdersScreen"),
  toOrderDetail: (orderId: number) => navigate("OrderDetail", {orderId}),

  // Profile flow
  toProfile: () => navigate("ProfileScreen"),
  toEditProfile: () => navigate("EditProfile"),
  toChangePassword: () => navigate("ChangePassword"),
  toAddressList: () => navigate("AddressList"),
  toAddAddress: (address?: any) => navigate("AddAddress", {address}),
  toFavoritesList: () => navigate("FavoritesList"),
  toMyReviews: () => navigate("MyReviews"),
  toNotificationSettings: () => navigate("NotificationSettings"),
  toOrderStats: () => navigate("OrderStats"),
  toSupport: () => navigate("Support"),
  toTermsPrivacy: () => navigate("TermsPrivacy"),

  // Shipper flow
  toShipperDashboard: () => navigate("ShipperDashboard"),
  toShipperAvailableOrders: () => {
    if (navigationRef.isReady()) {
      // Try opening Available tab and its nested screen
      navigationRef.navigate("Available" as any, {screen: "ShipperAvailableOrders"});
    }
  },
  toShipperDeliveries: () => {
    if (navigationRef.isReady()) {
      // Try opening Active tab and its nested screen
      navigationRef.navigate("Active" as any, {screen: "ShipperDeliveries"});
    }
  },
  toShipperHistory: () => {
    if (navigationRef.isReady()) {
      // Try Dashboard tab nested ShipperHistory first
      navigationRef.navigate("Dashboard" as any, {screen: "ShipperHistory"});
      // Also try Profile stack variant just in case
      navigationRef.navigate("Profile" as any, {screen: "ShipperHistoryDelivery"});
    }
  },

  // Common
  toNotifications: () => navigate("Notifications"),
  toSettings: () => navigate("Settings"),

  // Navigation actions
  goBack,
  reset,
  replace,
};

export default NavigationService;
