export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || process.env.EXPO_PUBLIC_API_URL_DEV || "http://localhost:3000/api",
  TIMEOUT: 10000,
  RETRY_COUNT: 3,
};

export const ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    ME: "/auth/me",
    CHANGE_PASSWORD: "/auth/change-password",
  },

  // Users
  USERS: {
    BASE: "/users",
    GET_ONE: (id: number) => `/users/${id}`,
    PROFILE: "/users/profile",
    ACTIVITY: (id: number) => `/users/${id}/activity`,
  },

  // Restaurants
  RESTAURANTS: {
    BASE: "/restaurants",
    GET_ONE: (id: number) => `/restaurants/${id}`,
    NEARBY: "/restaurants/nearby",
    MENU: (id: number) => `/restaurants/${id}/products`,
    SEARCH: "/restaurants/search",
  },

  // Products
  PRODUCTS: {
    BASE: "/products",
    GET_ONE: (id: number) => `/products/${id}`,
    SEARCH: "/products/search",
    DISCOUNTED: "/products/discounted",
  },

  // Cart
  CART: {
    BASE: "/cart",
    ADD: "/cart",
    UPDATE: (id: number) => `/cart/${id}`,
    REMOVE: (id: number) => `/cart/${id}`,
    SYNC: "/cart/sync",
    CLEAR: "/cart",
  },

  // Orders
  ORDERS: {
    BASE: "/orders",
    GET_ONE: (id: number) => `/orders/${id}`,
    CREATE: "/orders",
    CANCEL: (id: number) => `/orders/${id}`,
    REORDER: (id: number) => `/orders/${id}/reorder`,
    RATE: (id: number) => `/orders/${id}/rate`,
  },

  // Favorites
  FAVORITES: {
    BASE: "/favorites",
    GET_BY_TYPE: (type: string) => `/favorites/${type}`,
    TOGGLE: (type: string, id: number) => `/favorites/${type}/${id}/toggle`,
  },

  // Reviews
  REVIEWS: {
    BASE: "/reviews",
    CREATE: "/reviews",
    GET_RESTAURANT: (id: number) => `/reviews/restaurant/${id}`,
  },

  // Promotions
  PROMOTIONS: {
    BASE: "/promotions",
    VALIDATE: "/promotions/validate",
  },

  // Notifications
  NOTIFICATIONS: {
    BASE: "/notifications",
    MARK_READ: (id: number) => `/notifications/${id}/read`,
  },

  SHIPPER: {
    AVAILABLE_ORDERS: "/shipper/orders/available",
    ACCEPT_ORDER: (id: number) => `/shipper/orders/${id}/accept`,
    DELIVERIES: "/shipper/orders/my-deliveries",
    UPDATE_STATUS: (id: number) => `/shipper/orders/${id}/status`,
    HISTORY: "/shipper/orders/history",
    STATS: "/shipper/stats",
  },
};
