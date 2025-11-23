import {COLORS} from "@/src/styles/colors";
import {StyleSheet} from "react-native";

export const styles = StyleSheet.create({
  // Base card
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  // Horizontal variant
  horizontalCard: {
    flexDirection: "row",
  },
  horizontalImageContainer: {
    width: 100,
    height: "100%",
    position: "relative",
  },
  horizontalImage: {
    width: "100%",
    height: "100%",
  },
  horizontalContent: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },

  // Minimal variant
  minimalCard: {
    padding: 12,
  },

  // Image
  imageContainer: {
    position: "relative",
    width: "100%",
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  image: {
    width: "100%",
    height: "100%",
  },

  // Badge
  badge: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  badgeText: {
    color: COLORS.WHITE,
    fontSize: 11,
    fontWeight: "700",
  },

  // Rating badge (on image)
  ratingBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.WHITE,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    gap: 4,
  },
  ratingBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.DARK,
  },

  // Content
  content: {
    padding: 12,
  },

  // Text
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.DARK,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.GRAY,
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: COLORS.GRAY,
    marginBottom: 8,
    lineHeight: 18,
  },

  // Rating
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.DARK,
  },

  // Skeleton loading
  skeleton: {
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 4,
  },
  skeletonImage: {
    width: "100%",
  },
  skeletonTitle: {
    height: 16,
    width: "80%",
    marginBottom: 8,
  },
  skeletonSubtitle: {
    height: 12,
    width: "60%",
    marginBottom: 8,
  },
  skeletonDescription: {
    height: 12,
    width: "90%",
  },
});
