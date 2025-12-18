type AppEnv = "development" | "staging" | "production";

const ENV = {
  development: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL_DEV!,
    logLevel: "debug",
  },
  staging: {
    apiUrl: "https://staging-api.funfood.com",
    logLevel: "info",
  },
  production: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL!,
    logLevel: "warn",
  },
};

const currentEnv = (process.env.EXPO_PUBLIC_ENV || "development") as AppEnv;

const config = ENV[currentEnv];

if (!config?.apiUrl) {
  console.error("❌ API URL is undefined. Check ENV config");
}

export default config;
