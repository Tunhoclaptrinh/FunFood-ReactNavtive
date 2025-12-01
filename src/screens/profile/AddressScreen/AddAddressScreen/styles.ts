import {COLORS} from "@/src/styles/colors";
import {StyleSheet} from "react-native";

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.WHITE},

  header: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  headerSubtitle: {fontSize: 18, color: COLORS.GRAY, margin: "auto"},

  formSection: {padding: 16},
  inputContainer: {marginBottom: 12},

  labelRow: {flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8},
  label: {fontSize: 14, fontWeight: "600", color: COLORS.DARK},
  required: {color: COLORS.ERROR, marginLeft: 4, fontSize: 14, fontWeight: "600"},

  labelOptions: {flexDirection: "row", gap: 12, marginBottom: 4},
  labelOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
    backgroundColor: COLORS.WHITE,
  },
  labelOptionActive: {
    backgroundColor: COLORS.PRIMARY,
  },
  labelOptionText: {fontSize: 14, fontWeight: "600", color: COLORS.PRIMARY},
  labelOptionTextActive: {color: COLORS.WHITE},

  gpsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 8,
    padding: 12,
  },
  gpsInfo: {flex: 1},
  gpsText: {fontSize: 13, fontWeight: "600", color: COLORS.DARK, marginBottom: 4},
  gpsSubtext: {fontSize: 11, color: COLORS.SUCCESS},
  gpsPlaceholder: {fontSize: 13, color: COLORS.GRAY},
  gpsButton: {paddingHorizontal: 16},

  defaultContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF8E1",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  defaultInfo: {flex: 1, flexDirection: "row", alignItems: "center", gap: 12},
  defaultText: {flex: 1},
  defaultTitle: {fontSize: 15, fontWeight: "600", color: COLORS.DARK, marginBottom: 4},
  defaultSubtitle: {fontSize: 12, color: COLORS.GRAY},

  noteContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  noteText: {fontSize: 12, color: COLORS.INFO, flex: 1},

  bottomButtons: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: COLORS.WHITE,
    borderTopWidth: 1,
    borderTopColor: COLORS.LIGHT_GRAY,
  },
  cancelButton: {flex: 1},
  saveButton: {flex: 1},
});

export default styles;
