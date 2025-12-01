// src/utils/i18n.ts
import {useSettingsStore} from "@/src/stores/settingsStore";

const translations = {
  vi: {
    settings: "Cài đặt",
    general: "Cài đặt chung",
    language: "Ngôn ngữ",
    theme: "Giao diện",
    theme_dark: "Tối",
    theme_light: "Sáng",
    security: "Bảo mật & Dữ liệu",
    biometrics: "Đăng nhập sinh trắc học",
    notifications: "Thông báo",
    clear_cache: "Xóa bộ nhớ đệm",
    info: "Thông tin",
    version: "Phiên bản",
    logout: "Đăng xuất",
    cancel: "Hủy",
    confirm: "Xác nhận",
    success: "Thành công",
    error: "Lỗi",
    biometrics_error: "Thiết bị không hỗ trợ sinh trắc học",
    cache_cleared: "Đã dọn dẹp bộ nhớ đệm",
    login: "Đăng nhập",
  },
  en: {
    settings: "Settings",
    general: "General",
    language: "Language",
    theme: "Appearance",
    theme_dark: "Dark",
    theme_light: "Light",
    security: "Security & Data",
    biometrics: "Biometric Login",
    notifications: "Notifications",
    clear_cache: "Clear Cache",
    info: "Information",
    version: "Version",
    logout: "Logout",
    cancel: "Cancel",
    confirm: "Confirm",
    success: "Success",
    error: "Error",
    biometrics_error: "Biometrics not supported",
    cache_cleared: "Cache cleared successfully",
    login: "Login",
  },
};

// Hook để lấy text
export const useTranslation = () => {
  const language = useSettingsStore((state) => state.language);

  return {
    t: (key: keyof (typeof translations)["vi"]) => translations[language][key] || key,
    locale: language,
  };
};
