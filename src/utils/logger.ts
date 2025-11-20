type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel = LOG_LEVELS.info;

const log = (level: LogLevel, message: string, data?: any) => {
  if (LOG_LEVELS[level] >= currentLevel) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`, data ? data : "");
  }
};

export const logger = {
  debug: (message: string, data?: any) => log("debug", message, data),
  info: (message: string, data?: any) => log("info", message, data),
  warn: (message: string, data?: any) => log("warn", message, data),
  error: (message: string, error?: any) => log("error", message, error),
};
