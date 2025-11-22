import {createBaseStore} from "@/src/base/BaseStore";
import {NotificationService, Notification} from "@services/notification.service";

export const useNotificationStore = createBaseStore<Notification>(NotificationService, "notifications", {
  pageSize: 20,
  initialSort: {field: "createdAt", order: "desc"},
});

export const useNotifications = () => {
  const store = useNotificationStore();

  const markAsRead = async (id: number) => {
    try {
      await NotificationService.markAsRead(id);
      store.updateItem(id, {isRead: true} as any);
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      const updatedItems = store.items.map((item) => ({...item, isRead: true}));
      store.setItems(updatedItems);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      await NotificationService.deleteNotification(id);
      store.removeItem(id);
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const clearAll = async () => {
    try {
      await NotificationService.clearAll();
      store.setItems([]);
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  const getUnreadCount = () => {
    return store.items.filter((item) => !item.isRead).length;
  };

  return {
    ...store,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    unreadCount: getUnreadCount(),
  };
};
