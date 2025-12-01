import {create} from "zustand";
import {persist, createJSONStorage} from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Theme = "light" | "dark";
type Language = "vi" | "en";

interface SettingsState {
  theme: Theme;
  language: Language;
  notificationsEnabled: boolean;
  biometricsEnabled: boolean; // Tính năng đăng nhập vân tay/faceID (placeholder)

  // Actions
  setTheme: (theme: Theme) => void;
  setLanguage: (lang: Language) => void;
  toggleNotifications: () => void;
  toggleBiometrics: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "light",
      language: "vi",
      notificationsEnabled: true,
      biometricsEnabled: false,

      setTheme: (theme) => set({theme}),
      setLanguage: (language) => set({language}),
      toggleNotifications: () => set((state) => ({notificationsEnabled: !state.notificationsEnabled})),
      toggleBiometrics: () => set((state) => ({biometricsEnabled: !state.biometricsEnabled})),
    }),
    {
      name: "settings-storage", // Tên key trong AsyncStorage
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
