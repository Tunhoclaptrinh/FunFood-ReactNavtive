import {COLORS} from "@/src/styles/colors";
import {StyleSheet} from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 48,
  },

  // Icon
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },

  // Text
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.DARK,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.GRAY,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },

  // Custom content
  customContent: {
    width: "100%",
    marginBottom: 24,
  },

  // Actions
  actionsContainer: {
    width: "100%",
    gap: 12,
  },
  primaryAction: {
    width: "100%",
  },
  secondaryAction: {
    width: "100%",
  },
});
