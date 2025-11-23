import {COLORS} from "@/src/styles/colors";
import {StyleSheet} from "react-native";

export const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  // Variants
  primaryButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  secondaryButton: {
    backgroundColor: COLORS.SECONDARY,
  },
  outlineButton: {
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
    backgroundColor: "transparent",
  },
  ghostButton: {
    backgroundColor: "transparent",
  },
  dangerButton: {
    backgroundColor: COLORS.ERROR,
  },

  // Sizes
  smallSize: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 36,
  },
  mediumSize: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    minHeight: 44,
  },
  largeSize: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    minHeight: 52,
  },

  // Disabled states
  disabledButton: {
    opacity: 0.6,
  },
  primaryDisabled: {
    backgroundColor: COLORS.GRAY,
  },
  secondaryDisabled: {
    backgroundColor: COLORS.GRAY,
  },
  outlineDisabled: {
    borderColor: COLORS.GRAY,
  },
  dangerDisabled: {
    backgroundColor: COLORS.GRAY,
  },
  // Ensure ghost variant has a disabled key so dynamic indexing is safe
  ghostDisabled: {
    backgroundColor: "transparent",
  },

  // Content
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  // Text
  text: {
    fontWeight: "600",
  },
  primaryText: {
    color: COLORS.WHITE,
  },
  secondaryText: {
    color: COLORS.WHITE,
  },
  outlineText: {
    color: COLORS.PRIMARY,
  },
  ghostText: {
    color: COLORS.PRIMARY,
  },
  dangerText: {
    color: COLORS.WHITE,
  },
  disabledText: {
    // Color handled dynamically
  },

  // Text sizes
  smallText: {
    fontSize: 13,
  },
  mediumText: {
    fontSize: 15,
  },
  largeText: {
    fontSize: 17,
  },

  // Icons
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },

  // Full width
  fullWidth: {
    width: "100%",
  },
});
