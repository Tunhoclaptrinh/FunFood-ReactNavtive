// src/hooks/useTheme.ts
import {useSettingsStore} from "@/src/stores/settingsStore";
import {LightTheme, DarkTheme} from "@/src/styles/theme";

export const useTheme = () => {
  const themeMode = useSettingsStore((state) => state.theme);

  const colors = themeMode === "dark" ? DarkTheme : LightTheme;
  const isDark = themeMode === "dark";

  return {colors, isDark, themeMode};
};
