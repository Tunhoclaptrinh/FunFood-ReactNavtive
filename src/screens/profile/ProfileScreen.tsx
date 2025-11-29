import React, {useState, useEffect} from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  RefreshControl,
} from "react-native";
import SafeAreaView from "@/src/components/common/SafeAreaView";
import {Ionicons} from "@expo/vector-icons";
import {useAuth} from "@hooks/useAuth";
import {apiClient} from "@config/api.client";
import {LinearGradient} from "expo-linear-gradient";
import {COLORS} from "@/src/styles/colors";

interface UserStats {
  totalOrders: number;
  completedOrders: number;
  totalSpent: number;
  avgOrderValue: number;
  totalReviews: number;
  avgRating: number;
  totalFavorites: number;
}

const ProfileScreen = ({navigation}: any) => {
  const {user, signOut} = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await apiClient.get<{data?: {stats?: UserStats}}>(`/users/${user.id}/activity`);
      setStats(
        response.data?.data?.stats ?? {
          totalOrders: 0,
          completedOrders: 0,
          totalSpent: 0,
          avgOrderValue: 0,
          totalReviews: 0,
          avgRating: 0,
          totalFavorites: 0,
        }
      );
    } catch (error) {
      console.error("Error loading stats:", error);
      setStats({
        totalOrders: 0,
        completedOrders: 0,
        totalSpent: 0,
        avgOrderValue: 0,
        totalReviews: 0,
        avgRating: 0,
        totalFavorites: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUserStats();
    setRefreshing(false);
  };

  const handleLogout = () => {
   // Logout alert
    Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất không?", [
      {text: "Hủy", style: "cancel"},
      {
        text: "Đăng xuất",
        onPress: async () => {
          await signOut();
        },
        style: "destructive",
      },
    ]);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const mainMenuItems = [
    {
      icon: "person-outline",
      title: "Chỉnh sửa hồ sơ",
      subtitle: "Cập nhật thông tin cá nhân của bạn",
      screen: "EditProfile",
      color: COLORS.PRIMARY,
      bgColor: "#FFE5E5",
    },
    {
      icon: "location-outline",
      title: "Địa chỉ giao hàng",
      subtitle: "Quản lý các địa chỉ đã lưu",
      screen: "AddressList",
      color: "#2ECC71",
      bgColor: "#E8F8F1",
    },
    {
      icon: "heart-outline",
      title: "Yêu thích của tôi",
      subtitle: "Nhà hàng & món ăn bạn yêu thích",
      screen: "FavoritesList",
      color: "#E91E63",
      bgColor: "#FCE4EC",
    },
    {
      icon: "receipt-outline",
      title: "Lịch sử đơn hàng",
      subtitle: "Xem tất cả đơn hàng trước đây",
      screen: "Orders",
      color: "#9C27B0",
      bgColor: "#F3E5F5",
    },
  ];

  const settingsItems = [
    {
      icon: "lock-closed-outline",
      title: "Đổi mật khẩu",
      subtitle: "Cập nhật mật khẩu của bạn",
      screen: "ChangePassword",
    },
    {
      icon: "notifications-outline",
      title: "Thông báo",
      subtitle: "Quản lý cài đặt thông báo",
      screen: "NotificationSettings",
    },
    {
      icon: "help-circle-outline",
      title: "Trợ giúp & Hỗ trợ",
      subtitle: "Nhận trợ giúp hoặc liên hệ hỗ trợ",
      screen: "Support",
    },
    {
      icon: "document-text-outline",
      title: "Điều khoản & Quyền riêng tư",
      subtitle: "Đọc điều khoản và chính sách quyền riêng tư",
      screen: "TermsPrivacy",
    },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Đang tải hồ sơ...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.PRIMARY]}
            tintColor={COLORS.PRIMARY}
          />
        }
      >
        {/* Compact Header with Gradient */}
        <LinearGradient colors={[COLORS.PRIMARY, "#FF8E8E"]} style={styles.headerGradient}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate("Settings")}>
              <Ionicons name="settings-outline" size={24} color={COLORS.WHITE} />
            </TouchableOpacity>

            {/* Compact Avatar Section */}
            <View style={styles.avatarSection}>
              <View style={styles.avatarContainer}>
                {user?.avatar ? (
                  <Image source={{uri: user.avatar}} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || "U"}</Text>
                  </View>
                )}
                <TouchableOpacity style={styles.editAvatarButton} onPress={() => navigation.navigate("EditProfile")}>
                  <Ionicons name="camera" size={14} color={COLORS.WHITE} />
                </TouchableOpacity>
              </View>

              <View style={styles.userInfoContainer}>
                <Text style={styles.userName}>{user?.name}</Text>
                <Text style={styles.userEmail}>{user?.email}</Text>
                <View style={styles.roleBadge}>
                  <Ionicons name="shield-checkmark" size={10} color={COLORS.WHITE} />
                  <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Stats Grid 2x2 */}
        {stats && (
          <View style={styles.statsGridSection}>
            <TouchableOpacity
              style={styles.statsCard}
              onPress={() => navigation.navigate("OrderStats")}
              activeOpacity={0.7}
            >
              <View style={styles.statsCardIcon}>
                <Ionicons name="receipt-outline" size={24} color={COLORS.PRIMARY} />
              </View>
              <Text style={styles.statsCardLabel}>Tổng số đơn hàng</Text>
              <Text style={styles.statsCardValue}>{stats.totalOrders}</Text>
              <Text style={styles.statsCardDetail}>{stats.completedOrders} đã hoàn thành</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.statsCard}
              onPress={() => navigation.navigate("OrderStats")}
              activeOpacity={0.7}
            >
              <View style={styles.statsCardIcon}>
                <Ionicons name="wallet-outline" size={24} color="#FFA000" />
              </View>
              <Text style={styles.statsCardLabel}>Tổng chi tiêu</Text>
              <Text style={styles.statsCardValue}>
                {formatCurrency(stats.totalSpent).substring(0, formatCurrency(stats.totalSpent).length - 3)}
              </Text>
              <Text style={styles.statsCardDetail}>
                trung bình {formatCurrency(stats.avgOrderValue).substring(0, formatCurrency(stats.avgOrderValue).length - 3)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.statsCard}
              onPress={() => navigation.navigate("FavoritesList")}
              activeOpacity={0.7}
            >
              <View style={styles.statsCardIcon}>
                <Ionicons name="heart" size={24} color="#E91E63" />
              </View>
              <Text style={styles.statsCardLabel}>Yêu thích</Text>
              <Text style={styles.statsCardValue}>{stats.totalFavorites}</Text>
              <Text style={styles.statsCardDetail}>Mục đã lưu</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.statsCard}
              onPress={() => navigation.navigate("MyReviews")}
              activeOpacity={0.7}
            >
              <View style={styles.statsCardIcon}>
                <Ionicons name="star" size={24} color="#4CAF50" />
              </View>
              <Text style={styles.statsCardLabel}>AĐánh giá TB</Text>
              <Text style={styles.statsCardValue}>{stats.avgRating.toFixed(1)} ⭐</Text>
              <Text style={styles.statsCardDetail}>{stats.totalReviews} đánh giá</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Main Menu Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tài khoản</Text>
          <View style={styles.menuContainer}>
            {mainMenuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.mainMenuItem, index === mainMenuItems.length - 1 && styles.lastMenuItem]}
                onPress={() => navigation.navigate(item.screen)}
                activeOpacity={0.7}
              >
                <View style={[styles.menuIcon, {backgroundColor: item.bgColor}]}>
                  <Ionicons name={item.icon as any} size={20} color={item.color} />
                </View>
                <View style={styles.mainMenuContent}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.GRAY} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cài đặt</Text>
          <View style={styles.menuContainer}>
            {settingsItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.settingsMenuItem, index === settingsItems.length - 1 && styles.lastMenuItem]}
                onPress={() => navigation.navigate(item.screen)}
                activeOpacity={0.7}
              >
                <View style={styles.menuIcon}>
                  <Ionicons name={item.icon as any} size={20} color={COLORS.GRAY} />
                </View>
                <View style={styles.settingsMenuContent}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.GRAY} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
            <Ionicons name="log-out-outline" size={22} color={COLORS.WHITE} />
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionSection}>
          <Text style={styles.versionText}>FunFood Mobile</Text>
          <Text style={styles.versionNumber}>Version 1.0.0</Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.GRAY,
  },
  headerGradient: {
    paddingBottom: 12,
  },
  header: {
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  settingsButton: {
    position: "absolute",
    top: 12,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  avatarSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingRight: 50,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: COLORS.WHITE,
  },
  avatarPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.WHITE,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.PRIMARY,
  },
  editAvatarButton: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.WHITE,
  },
  userInfoContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.WHITE,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
    marginBottom: 6,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 3,
    alignSelf: "flex-start",
  },
  roleText: {
    fontSize: 9,
    fontWeight: "700",
    color: COLORS.WHITE,
    letterSpacing: 0.3,
  },
  statsGridSection: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 4,
    gap: 8,
  },
  statsCard: {
    width: "48%",
    backgroundColor: COLORS.WHITE,
    padding: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    borderRadius: 10,
  },
  statsCardIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  statsCardLabel: {
    fontSize: 11,
    color: COLORS.GRAY,
    fontWeight: "500",
    marginBottom: 4,
  },
  statsCardValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.DARK,
    marginBottom: 2,
  },
  statsCardDetail: {
    fontSize: 9,
    color: COLORS.GRAY,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: COLORS.DARK,
    marginBottom: 8,
  },
  menuContainer: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  mainMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  mainMenuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.DARK,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    color: COLORS.GRAY,
  },
  settingsMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingsMenuContent: {
    flex: 1,
  },
  logoutSection: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    color: COLORS.WHITE,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.PRIMARY,
    gap: 8,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.WHITE,
  },
  versionSection: {
    alignItems: "center",
    paddingVertical: 8,
  },
  versionText: {
    fontSize: 12,
    color: COLORS.GRAY,
    fontWeight: "500",
  },
  versionNumber: {
    fontSize: 11,
    color: COLORS.GRAY,
  },
  bottomPadding: {
    height: 16,
  },
});

export default ProfileScreen;
