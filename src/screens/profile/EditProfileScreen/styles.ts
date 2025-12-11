import {COLORS} from "@/src/styles/colors";
import {StyleSheet} from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 8,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: COLORS.WHITE,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: COLORS.WHITE,
  },
  avatarText: {
    fontSize: 48,
    fontWeight: "bold",
    color: COLORS.WHITE,
  },
  cameraIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: COLORS.WHITE,
  },
  avatarHint: {
    fontSize: 13,
    color: COLORS.GRAY,
    fontWeight: "500",
  },
  formSection: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 12,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.DARK,
  },
  input: {
    marginVertical: 0,
  },
  readonlyInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  readonlyText: {
    fontSize: 15,
    color: COLORS.GRAY,
  },
  readonlyBadge: {
    backgroundColor: COLORS.SUCCESS,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  readonlyBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.WHITE,
  },
  noteContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  noteText: {
    fontSize: 12,
    color: COLORS.INFO,
    flex: 1,
  },
  bottomButtons: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 12,
    backgroundColor: COLORS.WHITE,
    borderTopWidth: 1,
    borderTopColor: COLORS.LIGHT_GRAY,
    shadowColor: COLORS.BLACK,
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 1,
    marginBottom: 25,
  },
});

export default styles;
