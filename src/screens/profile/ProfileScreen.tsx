import React, {useState, useEffect} from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  Image,
  RefreshControl,
} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {useAuth} from "@hooks/useAuth";
import {apiClient} from "@config/api.client";
import {COLORS} from "@config/constants";
import {LinearGradient} from "expo-linear-gradient";

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
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {text: "Cancel", style: "cancel"},
      {
        text: "Logout",
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
      title: "Edit Profile",
      subtitle: "Update your personal information",
      screen: "EditProfile",
      color: COLORS.PRIMARY,
      bgColor: "#FFE5E5",
    },
    {
      icon: "location-outline",
      title: "Delivery Addresses",
      subtitle: "Manage your saved addresses",
      screen: "AddressList",
      color: "#2ECC71",
      bgColor: "#E8F8F1",
    },
    {
      icon: "heart-outline",
      title: "My Favorites",
      subtitle: "Your favorite restaurants & foods",
      screen: "FavoritesList",
      color: "#E91E63",
      bgColor: "#FCE4EC",
    },
    {
      icon: "receipt-outline",
      title: "Order History",
      subtitle: "View all your past orders",
      screen: "Orders",
      color: "#9C27B0",
      bgColor: "#F3E5F5",
    },
  ];

  const settingsItems = [
    {
      icon: "lock-closed-outline",
      title: "Change Password",
      subtitle: "Update your password",
      screen: "ChangePassword",
    },
    {
      icon: "notifications-outline",
      title: "Notifications",
      subtitle: "Manage notification settings",
      screen: "NotificationSettings",
    },
    {
      icon: "help-circle-outline",
      title: "Help & Support",
      subtitle: "Get help or contact support",
      screen: "Support",
    },
    {
      icon: "document-text-outline",
      title: "Terms & Privacy",
      subtitle: "Read our terms and privacy policy",
      screen: "TermsPrivacy",
    },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Loading profile...</Text>
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
        {/* Header with Gradient */}
        <LinearGradient colors={[COLORS.PRIMARY, "#FF8E8E"]} style={styles.headerGradient}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate("Settings")}>
              <Ionicons name="settings-outline" size={24} color={COLORS.WHITE} />
            </TouchableOpacity>

            <View style={styles.avatarContainer}>
              {user?.avatar ? (
                <Image source={{uri: user.avatar}} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || "U"}</Text>
                </View>
              )}
              <TouchableOpacity style={styles.editAvatarButton} onPress={() => navigation.navigate("EditProfile")}>
                <Ionicons name="camera" size={16} color={COLORS.WHITE} />
              </TouchableOpacity>
            </View>

            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>

            <View style={styles.roleBadge}>
              <Ionicons name="shield-checkmark" size={12} color={COLORS.WHITE} />
              <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Stats Grid */}
        {stats && (
          <View style={styles.statsSection}>
            <TouchableOpacity
              style={styles.statsCard}
              onPress={() => navigation.navigate("OrderStats")}
              activeOpacity={0.7}
            >
              <View style={[styles.statsIconContainer, {backgroundColor: "#FFE5E5"}]}>
                <Ionicons name="receipt-outline" size={28} color={COLORS.PRIMARY} />
              </View>
              <Text style={styles.statsValue}>{stats.totalOrders}</Text>
              <Text style={styles.statsLabel}>Total Orders</Text>
              <Text style={styles.statsSubtext}>{stats.completedOrders} completed</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.statsCard}
              onPress={() => navigation.navigate("OrderStats")}
              activeOpacity={0.7}
            >
              <View style={[styles.statsIconContainer, {backgroundColor: "#FFF8E1"}]}>
                <Ionicons name="wallet-outline" size={28} color="#FFA000" />
              </View>
              <Text style={styles.statsValue}>{formatCurrency(stats.totalSpent)}</Text>
              <Text style={styles.statsLabel}>Total Spent</Text>
              <Text style={styles.statsSubtext}>Avg {formatCurrency(stats.avgOrderValue)}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.statsCard}
              onPress={() => navigation.navigate("FavoritesList")}
              activeOpacity={0.7}
            >
              <View style={[styles.statsIconContainer, {backgroundColor: "#FCE4EC"}]}>
                <Ionicons name="heart" size={28} color="#E91E63" />
              </View>
              <Text style={styles.statsValue}>{stats.totalFavorites}</Text>
              <Text style={styles.statsLabel}>Favorites</Text>
              <Text style={styles.statsSubtext}>Saved items</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.statsCard}
              onPress={() => navigation.navigate("MyReviews")}
              activeOpacity={0.7}
            >
              <View style={[styles.statsIconContainer, {backgroundColor: "#FFF8E1"}]}>
                <Ionicons name="star" size={28} color="#FFB800" />
              </View>
              <Text style={styles.statsValue}>{stats.avgRating.toFixed(1)}</Text>
              <Text style={styles.statsLabel}>Avg Rating</Text>
              <Text style={styles.statsSubtext}>{stats.totalReviews} reviews</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Main Menu Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.menuContainer}>
            {mainMenuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.mainMenuItem}
                onPress={() => navigation.navigate(item.screen)}
                activeOpacity={0.7}
              >
                <View style={[styles.mainMenuIcon, {backgroundColor: item.bgColor}]}>
                  <Ionicons name={item.icon as any} size={24} color={item.color} />
                </View>
                <View style={styles.mainMenuContent}>
                  <Text style={styles.mainMenuTitle}>{item.title}</Text>
                  <Text style={styles.mainMenuSubtitle}>{item.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.GRAY} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.menuContainer}>
            {settingsItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.settingsMenuItem}
                onPress={() => navigation.navigate(item.screen)}
                activeOpacity={0.7}
              >
                <View style={styles.settingsMenuIcon}>
                  <Ionicons name={item.icon as any} size={20} color={COLORS.GRAY} />
                </View>
                <View style={styles.settingsMenuContent}>
                  <Text style={styles.settingsMenuTitle}>{item.title}</Text>
                  <Text style={styles.settingsMenuSubtitle}>{item.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.GRAY} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
            <Ionicons name="log-out-outline" size={22} color={COLORS.ERROR} />
            <Text style={styles.logoutText}>Logout</Text>
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
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  settingsButton: {
    position: "absolute",
    top: 20,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: COLORS.WHITE,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.WHITE,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.3)",
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "bold",
    color: COLORS.PRIMARY,
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: COLORS.WHITE,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.WHITE,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 12,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  roleText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.WHITE,
    letterSpacing: 0.5,
  },
  statsSection: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    marginTop: -20,
    gap: 12,
  },
  statsCard: {
    width: "48%",
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statsIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statsValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.DARK,
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 12,
    color: COLORS.GRAY,
    fontWeight: "500",
    marginBottom: 2,
  },
  statsSubtext: {
    fontSize: 10,
    color: COLORS.GRAY,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.DARK,
    marginBottom: 12,
  },
  menuContainer: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  mainMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  mainMenuIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  mainMenuContent: {
    flex: 1,
  },
  mainMenuTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.DARK,
    marginBottom: 4,
  },
  mainMenuSubtitle: {
    fontSize: 13,
    color: COLORS.GRAY,
  },
  settingsMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  settingsMenuIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingsMenuContent: {
    flex: 1,
  },
  settingsMenuTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.DARK,
    marginBottom: 2,
  },
  settingsMenuSubtitle: {
    fontSize: 12,
    color: COLORS.GRAY,
  },
  logoutSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.WHITE,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: "#FFEBEE",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.ERROR,
  },
  versionSection: {
    alignItems: "center",
    paddingVertical: 24,
  },
  versionText: {
    fontSize: 13,
    color: COLORS.GRAY,
    fontWeight: "500",
    marginBottom: 4,
  },
  versionNumber: {
    fontSize: 11,
    color: COLORS.GRAY,
  },
  bottomPadding: {
    height: 20,
  },
});

export default ProfileScreen;
