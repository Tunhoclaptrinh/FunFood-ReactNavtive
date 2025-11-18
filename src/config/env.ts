// Environment Configuration
export const ENV = {
  API_URL: process.env.REACT_APP_API_URL || "http://localhost:3000/api",
  ENV: process.env.REACT_APP_ENV || "development",
  DEBUG: process.env.REACT_APP_DEBUG === "true",
  LOG_LEVEL: process.env.REACT_APP_LOG_LEVEL || "info",

  // Features
  ENABLE_MAPS: process.env.REACT_APP_ENABLE_MAPS === "true",
  ENABLE_NOTIFICATIONS: process.env.REACT_APP_ENABLE_NOTIFICATIONS === "true",

  // Maps
  GOOGLE_MAPS_KEY: process.env.REACT_APP_GOOGLE_MAPS_KEY || "",
};

export const isDev = ENV.ENV === "development";
export const isProd = ENV.ENV === "production";
