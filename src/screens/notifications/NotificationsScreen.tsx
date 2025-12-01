import React, {useEffect, useState} from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import SafeAreaView from "@/src/components/common/SafeAreaView";
import {Ionicons} from "@expo/vector-icons";
import {useNotifications} from "@stores/notificationStore";
import EmptyState from "@/src/components/common/EmptyState/EmptyState";
import {COLORS} from "@/src/styles/colors";
import {formatDistanceToNow} from "date-fns";
import {vi} from "date-fns/locale";

const NotificationsScreen = ({navigation}: any) => {
  const {
    items,
    isLoading,
    isRefreshing,
    error,
    fetchAll,
    refresh,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    unreadCount,
  } = useNotifications();

  const [selectedTab, setSelectedTab] = useState<"all" | "unread">("all");

  useEffect(() => {
    fetchAll();
  }, []);

  const handleRefresh = () => {
    refresh();
  };

  const handleNotificationPress = async (notification: any) => {
    // Mark as read
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    // Navigate based on type
    if (notification.type === "order" && notification.refId) {
      navigation.navigate("OrderDetail", {orderId: notification.refId});
    } else if (notification.type === "promotion") {
      navigation.navigate("Search");
    } else if (notification.type === "review" && notification.refId) {
      navigation.navigate("RestaurantDetail", {restaurantId: notification.refId});
    }
  };

  const handleDeleteNotification = (id: number, title: string) => {
    Alert.alert("Xóa thông báo", `Bạn có chắc muốn xóa "${title}"?`, [
      {text: "Hủy", style: "cancel"},
      {
        text: "Xóa",
        onPress: () => deleteNotification(id),
        style: "destructive",
      },
    ]);
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount === 0) {
      Alert.alert("Thông báo", "Tất cả thông báo đã được đọc");
      return;
    }
    Alert.alert("Đánh dấu đã đọc", "Đánh dấu tất cả thông báo là đã đọc?", [
      {text: "Hủy", style: "cancel"},
      {text: "Đồng ý", onPress: markAllAsRead},
    ]);
  };

  const handleClearAll = () => {
    Alert.alert("Xóa tất cả", "Bạn có chắc muốn xóa tất cả thông báo?", [
      {text: "Hủy", style: "cancel"},
      {
        text: "Xóa tất cả",
        onPress: clearAll,
        style: "destructive",
      },
    ]);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order":
        return "receipt";
      case "promotion":
        return "pricetag";
      case "system":
        return "notifications";
      case "review":
        return "star";
      default:
        return "information-circle";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "order":
        return COLORS.PRIMARY;
      case "promotion":
        return COLORS.WARNING;
      case "system":
        return COLORS.INFO;
      case "review":
        return COLORS.SUCCESS;
      default:
        return COLORS.GRAY;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: vi,
      });
    } catch {
      return "Vừa xong";
    }
  };

  const filteredItems = selectedTab === "unread" ? items.filter((item) => !item.isRead) : items;

  if (isLoading && items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Đang tải thông báo...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thông báo</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={handleMarkAllAsRead}>
            <Ionicons name="checkmark-done" size={20} color={COLORS.PRIMARY} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleClearAll}>
            <Ionicons name="trash-outline" size={20} color={COLORS.ERROR} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === "all" && styles.tabActive]}
          onPress={() => setSelectedTab("all")}
        >
          <Text style={[styles.tabText, selectedTab === "all" && styles.tabTextActive]}>Tất cả ({items.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === "unread" && styles.tabActive]}
          onPress={() => setSelectedTab("unread")}
        >
          <Text style={[styles.tabText, selectedTab === "unread" && styles.tabTextActive]}>
            Chưa đọc ({unreadCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      {filteredItems.length === 0 ? (
        <EmptyState
          icon="notifications-off-outline"
          title={selectedTab === "unread" ? "Không có thông báo chưa đọc" : "Chưa có thông báo"}
          subtitle={selectedTab === "unread" ? "Tất cả thông báo đã được đọc" : "Bạn sẽ nhận được thông báo ở đây"}
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.PRIMARY]}
              tintColor={COLORS.PRIMARY}
            />
          }
        >
          {filteredItems.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[styles.notificationCard, !notification.isRead && styles.notificationUnread]}
              onPress={() => handleNotificationPress(notification)}
              activeOpacity={0.7}
            >
              <View
                style={[styles.notificationIcon, {backgroundColor: getNotificationColor(notification.type) + "20"}]}
              >
                <Ionicons
                  name={getNotificationIcon(notification.type) as any}
                  size={24}
                  color={getNotificationColor(notification.type)}
                />
              </View>

              <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                  <Text style={styles.notificationTitle} numberOfLines={1}>
                    {notification.title}
                  </Text>
                  {!notification.isRead && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.notificationMessage} numberOfLines={2}>
                  {notification.message}
                </Text>
                <Text style={styles.notificationTime}>{formatTime(notification.createdAt)}</Text>
              </View>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteNotification(notification.id, notification.title)}
              >
                <Ionicons name="close" size={20} color={COLORS.GRAY} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}

          <View style={styles.bottomPadding} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.GRAY,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.DARK,
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.LIGHT_GRAY,
    justifyContent: "center",
    alignItems: "center",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  tabActive: {
    backgroundColor: COLORS.PRIMARY,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.DARK_GRAY,
  },
  tabTextActive: {
    color: COLORS.WHITE,
  },
  notificationCard: {
    flexDirection: "row",
    backgroundColor: COLORS.WHITE,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  notificationUnread: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.PRIMARY,
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  notificationTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.DARK,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.PRIMARY,
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 13,
    color: COLORS.DARK_GRAY,
    lineHeight: 20,
    marginBottom: 6,
  },
  notificationTime: {
    fontSize: 11,
    color: COLORS.GRAY,
  },
  deleteButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomPadding: {
    height: 20,
  },
});

export default NotificationsScreen;
