/**
 * Routes Configuration
 * Centralized route definitions for the app
 */

export type RouteParams = {
  // Auth Stack
  Login: undefined;
  Register: undefined;

  // Main Stack - Home
  HomeScreen: undefined;
  RestaurantDetail: {restaurantId: number};
  ProductDetail: {productId: number};

  // Main Stack - Search
  SearchScreen: undefined;

  // Main Stack - Cart
  CartScreen: undefined;
  Checkout: undefined;

  // Main Stack - Orders
  OrdersScreen: undefined;
  OrderDetail: {orderId: number};

  // Main Stack - Profile
  ProfileScreen: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  AddressList: undefined;
  AddAddress: {address?: any};
  FavoritesList: undefined;
  MyReviews: undefined;
  NotificationSettings: undefined;
  OrderStats: undefined;
  Support: undefined;
  TermsPrivacy: undefined;

  // Shipper Stack
  ShipperDashboard: undefined;
  ShipperAvailableOrders: undefined;
  ShipperDeliveries: undefined;
  ShipperHistory: undefined;

  // Common
  Notifications: undefined;
  Settings: undefined;
};

export const ROUTE_NAMES = {
  // Auth
  AUTH: {
    LOGIN: "Login",
    REGISTER: "Register",
  },

  // Main Tabs
  TABS: {
    HOME: "Home",
    SEARCH: "Search",
    CART: "Cart",
    ORDERS: "Orders",
    PROFILE: "Profile",
  },

  // Home Stack
  HOME: {
    SCREEN: "HomeScreen",
    RESTAURANT_DETAIL: "RestaurantDetail",
    PRODUCT_DETAIL: "ProductDetail",
  },

  // Search Stack
  SEARCH: {
    SCREEN: "SearchScreen",
    RESTAURANT_DETAIL: "RestaurantDetail",
    PRODUCT_DETAIL: "ProductDetail",
  },

  // Cart Stack
  CART: {
    SCREEN: "CartScreen",
    CHECKOUT: "Checkout",
  },

  // Orders Stack
  ORDERS: {
    SCREEN: "OrdersScreen",
    DETAIL: "OrderDetail",
  },

  // Profile Stack
  PROFILE: {
    SCREEN: "ProfileScreen",
    EDIT_PROFILE: "EditProfile",
    CHANGE_PASSWORD: "ChangePassword",
    ADDRESS_LIST: "AddressList",
    ADD_ADDRESS: "AddAddress",
    FAVORITES_LIST: "FavoritesList",
    MY_REVIEWS: "MyReviews",
    NOTIFICATION_SETTINGS: "NotificationSettings",
    ORDER_STATS: "OrderStats",
    SUPPORT: "Support",
    TERMS_PRIVACY: "TermsPrivacy",
  },

  // Shipper
  SHIPPER: {
    DASHBOARD: "ShipperDashboard",
    AVAILABLE_ORDERS: "ShipperAvailableOrders",
    DELIVERIES: "ShipperDeliveries",
    HISTORY: "ShipperHistory",
  },

  // Common
  COMMON: {
    NOTIFICATIONS: "Notifications",
    SETTINGS: "Settings",
  },
} as const;

export const SCREEN_OPTIONS = {
  // Common header styles
  DEFAULT_HEADER: {
    headerShown: true,
    headerStyle: {
      backgroundColor: "#FFFFFF",
    },
    headerTintColor: "#FF6B6B",
    headerTitleStyle: {
      fontWeight: "700" as const,
    },
  },

  // Modal presentation
  MODAL: {
    presentation: "modal" as const,
  },

  // No header
  NO_HEADER: {
    headerShown: false,
  },

  // Tab bar icons
  TAB_ICONS: {
    HOME: {focused: "home", unfocused: "home-outline"},
    SEARCH: {focused: "search", unfocused: "search-outline"},
    CART: {focused: "cart", unfocused: "cart-outline"},
    ORDERS: {focused: "list", unfocused: "list-outline"},
    PROFILE: {focused: "person", unfocused: "person-outline"},
    DASHBOARD: {focused: "home", unfocused: "home-outline"},
    AVAILABLE: {focused: "list", unfocused: "list-outline"},
    ACTIVE: {focused: "car", unfocused: "car-outline"},
  },
} as const;

// Navigation helper types
export type RootStackParamList = RouteParams;
export type TabParamList = Pick<
  RouteParams,
  "HomeScreen" | "SearchScreen" | "CartScreen" | "OrdersScreen" | "ProfileScreen"
>;
