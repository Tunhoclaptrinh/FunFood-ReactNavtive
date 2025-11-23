import {COLORS} from "@/src/styles/colors";
import {StyleSheet} from "react-native";

export const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },

  // Label
  labelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.DARK,
  },
  required: {
    color: COLORS.ERROR,
  },
  charCount: {
    fontSize: 12,
    color: COLORS.GRAY,
  },

  // Input Container
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 12,
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  disabledInput: {
    backgroundColor: COLORS.LIGHT_GRAY,
    opacity: 0.6,
  },
  errorInput: {
    borderColor: COLORS.ERROR,
  },
  focusedInput: {
    borderColor: COLORS.PRIMARY,
    backgroundColor: COLORS.WHITE,
  },
  multilineContainer: {
    alignItems: "flex-start",
    paddingVertical: 12,
    minHeight: 80,
  },

  // Input
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.DARK,
    paddingVertical: 0,
  },
  inputWithLeftIcon: {
    marginLeft: 8,
  },
  inputWithRightIcon: {
    marginRight: 8,
  },
  multilineInput: {
    paddingTop: 0,
    textAlignVertical: "top",
  },

  // Icons
  leftIcon: {
    marginRight: 0,
  },
  rightIconButton: {
    padding: 4,
  },

  // Bottom Text
  bottomTextContainer: {
    marginTop: 6,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.ERROR,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.GRAY,
  },
});
