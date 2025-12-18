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

export const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  preparing: "Đang chuẩn bị",
  delivering: "Đang giao",
  on_the_way: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
  driver_arrived: "Đơn đã đến",
};
