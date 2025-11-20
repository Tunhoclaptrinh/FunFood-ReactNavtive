const ENV = {
  dev: {
    apiUrl: "http://localhost:3000/api",
    logLevel: "debug",
  },
  staging: {
    apiUrl: "https://staging-api.funfood.com",
    logLevel: "info",
  },
  prod: {
    apiUrl: "https://api.funfood.com",
    logLevel: "warn",
  },
};

const currentEnv = process.env.EXPO_PUBLIC_ENV || "development";

export default ENV[currentEnv as keyof typeof ENV];
