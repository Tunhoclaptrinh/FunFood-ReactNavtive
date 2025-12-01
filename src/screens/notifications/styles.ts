import {COLORS} from "@/src/styles/colors";
import {StyleSheet} from "react-native";

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
    paddingVertical: 8,
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

export default styles;
