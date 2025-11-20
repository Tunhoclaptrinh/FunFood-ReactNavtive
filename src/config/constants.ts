export const APP_NAME = "FunFood";
export const API_VERSION = "v1";
export const API_TIMEOUT = 10000;
export const PAGINATION_LIMIT = 10;

// Delivery Fee Calculation
export const DELIVERY_FEE_CONFIG = {
  BASE_FEE: 15000,
  PER_KM_FEE: 5000,
  EXTRA_PER_KM_FEE: 7000,
  MAX_FREE_DISTANCE: 2,
  STANDARD_DISTANCE: 5,
};

// Order Status
export const ORDER_STATUSES = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PREPARING: "preparing",
  DELIVERING: "delivering",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

// Payment Methods
export const PAYMENT_METHODS = {
  CASH: "cash",
  CARD: "card",
  MOMO: "momo",
  ZALOPAY: "zalopay",
};

// UI Colors
export const COLORS = {
  PRIMARY: "#FF6B6B",
  SECONDARY: "#4ECDC4",
  SUCCESS: "#2ECC71",
  ERROR: "#E74C3C",
  WARNING: "#F39C12",
  INFO: "#3498DB",
  LIGHT_GRAY: "#F5F5F5",
  GRAY: "#9CA3AF",
  DARK: "#1F2937",
  WHITE: "#FFFFFF",
  BLACK: "#000000",
};
