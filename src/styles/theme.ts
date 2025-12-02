// src/styles/theme.ts
import {COLORS as BASE_COLORS} from "./colors";

export const LightTheme = {
  ...BASE_COLORS,
  BACKGROUND: "#F8F9FA", // Màu nền sáng
  CARD_BG: "#FFFFFF", // Màu nền thẻ sáng
  TEXT_PRIMARY: "#1F2937",
  TEXT_SECONDARY: "#9CA3AF",
  BORDER: "#E5E7EB",
  ICON_BG: "#F3F4F6",
};

export const DarkTheme = {
  ...BASE_COLORS,
  BACKGROUND: "#121212", // Màu nền tối
  CARD_BG: "#1E1E1E", // Màu nền thẻ tối
  TEXT_PRIMARY: "#FFFFFF",
  TEXT_SECONDARY: "#A0A0A0",
  BORDER: "#333333",
  ICON_BG: "#2C2C2C",
  // Điều chỉnh lại một số màu cơ bản cho hợp dark mode
  LIGHT_GRAY: "#2C2C2C",
  WHITE: "#1E1E1E",
};
