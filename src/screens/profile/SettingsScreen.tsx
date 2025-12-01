// src/screens/profile/SettingsScreen.tsx
import React from "react";
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert} from "react-native";
import SafeAreaView from "@/src/components/common/SafeAreaView";
import {Ionicons} from "@expo/vector-icons";
import * as LocalAuthentication from "expo-local-authentication"; // Import thư viện
import {useSettingsStore} from "@/src/stores/settingsStore";
import {useAuthStore} from "@/src/stores/authStore";
import {useTheme} from "@/src/hooks/useTheme"; // Import theme hook
import {useTranslation} from "@/src/utils/i18n"; // Import i18n hook

const SettingsScreen = ({navigation}: any) => {
  // Sử dụng hook Theme và Translation
  const {colors, isDark} = useTheme();
  const {t, locale} = useTranslation();

  const {theme, setTheme, setLanguage, notificationsEnabled, toggleNotifications, biometricsEnabled, toggleBiometrics} =
    useSettingsStore();

  const {logout} = useAuthStore();

  // Xử lý bật/tắt Sinh trắc học thực tế
  const handleBiometricsToggle = async () => {
    // Nếu đang bật -> tắt ngay
    if (biometricsEnabled) {
      toggleBiometrics();
      return;
    }

    // Nếu đang tắt -> bật lên (cần kiểm tra phần cứng)
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        Alert.alert(t("error"), t("biometrics_error"));
        return;
      }

      // Xác thực thử để kích hoạt
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Xác thực để kích hoạt",
        fallbackLabel: "Sử dụng mật khẩu",
      });

      if (result.success) {
        toggleBiometrics();
        Alert.alert(t("success"), "Đã kích hoạt đăng nhập sinh trắc học");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleClearCache = () => {
    Alert.alert(t("clear_cache"), "Bạn có chắc chắn không?", [
      {text: t("cancel"), style: "cancel"},
      {
        text: t("confirm"),
        onPress: () => Alert.alert(t("success"), t("cache_cleared")),
      },
    ]);
  };

  // Helper render section (có style động theo theme)
  const renderSectionHeader = (title: string) => (
    <Text style={[styles.sectionHeader, {color: colors.TEXT_SECONDARY}]}>{title}</Text>
  );

  // Helper render item (có style động theo theme)
  const renderItem = (
    icon: string,
    label: string,
    rightElement: React.ReactNode,
    onPress?: () => void,
    iconColor: string = colors.PRIMARY
  ) => (
    <TouchableOpacity
      style={[styles.itemContainer, {backgroundColor: colors.CARD_BG, borderColor: colors.BORDER}]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View style={styles.itemLeft}>
        <View style={[styles.iconBox, {backgroundColor: iconColor + "15"}]}>
          <Ionicons name={icon as any} size={20} color={iconColor} />
        </View>
        <Text style={[styles.itemLabel, {color: colors.TEXT_PRIMARY}]}>{label}</Text>
      </View>
      <View style={styles.itemRight}>{rightElement}</View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.BACKGROUND}]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* --- Giao diện & Ngôn ngữ --- */}
        {renderSectionHeader(t("general"))}

        {renderItem(
          "language-outline",
          t("language"),
          <View style={{flexDirection: "row", alignItems: "center"}}>
            <Text style={[styles.valueText, {color: colors.TEXT_SECONDARY}]}>
              {locale === "vi" ? "Tiếng Việt" : "English"}
            </Text>
            <Ionicons name="chevron-forward" size={20} color={colors.TEXT_SECONDARY} />
          </View>,
          () => {
            Alert.alert(t("language"), "", [
              {text: "Tiếng Việt", onPress: () => setLanguage("vi")},
              {text: "English", onPress: () => setLanguage("en")},
            ]);
          },
          "#4CAF50"
        )}

        {renderItem(
          isDark ? "moon" : "sunny",
          t("theme"),
          <View style={{flexDirection: "row", alignItems: "center", gap: 8}}>
            <Text style={[styles.valueText, {color: colors.TEXT_SECONDARY}]}>
              {isDark ? t("theme_dark") : t("theme_light")}
            </Text>
            <Switch
              value={isDark}
              onValueChange={(val) => setTheme(val ? "dark" : "light")}
              trackColor={{false: "#E5E7EB", true: colors.PRIMARY}}
              thumbColor="#FFFFFF"
            />
          </View>,
          undefined,
          "#FF9800"
        )}

        {/* --- Bảo mật --- */}
        {renderSectionHeader(t("security"))}

        {renderItem(
          "finger-print-outline",
          t("biometrics"),
          <Switch
            value={biometricsEnabled}
            onValueChange={handleBiometricsToggle} // Sử dụng hàm xử lý thực tế
            trackColor={{false: "#E5E7EB", true: colors.PRIMARY}}
            thumbColor="#FFFFFF"
          />,
          undefined,
          "#9C27B0"
        )}

        {renderItem(
          "notifications-outline",
          t("notifications"),
          <Switch
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
            trackColor={{false: "#E5E7EB", true: colors.PRIMARY}}
            thumbColor="#FFFFFF"
          />,
          undefined,
          "#F44336"
        )}

        {renderItem(
          "trash-bin-outline",
          t("clear_cache"),
          <Ionicons name="chevron-forward" size={20} color={colors.TEXT_SECONDARY} />,
          handleClearCache,
          "#607D8B"
        )}

        {/* --- Thông tin --- */}
        {renderSectionHeader(t("info"))}

        {renderItem(
          "information-circle-outline",
          t("version"),
          <Text style={[styles.valueText, {color: colors.TEXT_SECONDARY}]}>1.0.0</Text>,
          undefined,
          colors.INFO
        )}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>{t("logout")}</Text>
        </TouchableOpacity>

        <Text style={[styles.footerText, {color: colors.TEXT_SECONDARY}]}>FunFood Mobile App © 2025</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 16,
    marginLeft: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "transparent", // Sẽ được ghi đè bởi inline style
    // Shadow nhẹ
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  itemLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  itemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  valueText: {
    fontSize: 14,
    marginRight: 8,
  },
  logoutButton: {
    marginTop: 32,
    backgroundColor: "#FEE2E2", // Đỏ nhạt
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  logoutText: {
    color: "#DC2626", // Đỏ đậm
    fontSize: 16,
    fontWeight: "700",
  },
  footerText: {
    textAlign: "center",
    marginTop: 24,
    fontSize: 12,
  },
});

export default SettingsScreen;
