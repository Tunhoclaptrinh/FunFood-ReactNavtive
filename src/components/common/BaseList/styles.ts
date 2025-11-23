import {COLORS} from "@/src/styles/colors";
import {StyleSheet} from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexGrow: 1,
  },

  // Loading footer
  loadingFooter: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: COLORS.GRAY,
    fontWeight: "500",
  },

  // Skeleton styles
  skeletonCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.LIGHT_GRAY,
  },
  skeletonImage: {
    width: "100%",
    height: 160,
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  skeletonContent: {
    padding: 12,
  },
  skeletonTitle: {
    height: 16,
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 4,
    marginBottom: 8,
    width: "70%",
  },
  skeletonSubtitle: {
    height: 14,
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 4,
    marginBottom: 8,
    width: "50%",
  },
  skeletonDescription: {
    height: 12,
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 4,
    width: "90%",
  },
});
