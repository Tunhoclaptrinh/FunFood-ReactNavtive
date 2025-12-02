import {COLORS} from "@/src/styles/colors";
import {StyleSheet} from "react-native";

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
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: COLORS.WHITE,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerSubtitle: {
    fontSize: 18,
    color: COLORS.GRAY,
    margin: "auto",
  },
  summarySection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  summaryCard: {
    flexDirection: "row",
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 16,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  summaryContent: {
    flex: 1,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.DARK,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 13,
    color: COLORS.GRAY,
    fontWeight: "500",
    marginBottom: 6,
  },
  summarySubinfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  summarySubtext: {
    fontSize: 12,
    color: COLORS.GRAY,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.DARK,
    marginBottom: 12,
  },
  // Styles mới cho Grid
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  gridItem: {
    width: "48%",
    backgroundColor: COLORS.WHITE,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 4,
  },
  gridIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  gridValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.DARK,
    marginBottom: 4,
  },
  gridTitle: {
    fontSize: 13,
    color: COLORS.GRAY,
  },
  // End Styles mới
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.PRIMARY,
  },
  statsCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statRow: {
    paddingVertical: 12,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingTop: 12,
  },
  miniStat: {
    alignItems: "center",
    flex: 1,
  },
  verticalDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  statInfo: {
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statIconLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.GRAY,
    fontWeight: "500",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.DARK,
  },
  statRightContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    justifyContent: "flex-end",
  },
  starsContainer: {
    flexDirection: "row",
    gap: 2,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: COLORS.SUCCESS,
    borderRadius: 4,
  },
  statDivider: {
    height: 1,
    backgroundColor: COLORS.LIGHT_GRAY,
    marginVertical: 4,
  },
  orderCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  orderId: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.DARK,
    marginBottom: 4,
  },
  orderRestaurant: {
    fontSize: 12,
    color: COLORS.GRAY,
  },
  orderStatus: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  orderStatusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.LIGHT_GRAY,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.PRIMARY,
  },
  orderDate: {
    fontSize: 12,
    color: COLORS.GRAY,
  },
  actionsSection: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
  },
  bottomPadding: {
    height: 24,
  },
});

export default styles;
