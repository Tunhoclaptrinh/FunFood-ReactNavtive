import {StyleSheet} from "react-native";
import {COLORS} from "./colors";
import {SPACING} from "./spacing";

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  screen: {
    flex: 1,
    paddingHorizontal: SPACING.LG,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  rowCenter: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
  },
  spaceBetween: {
    justifyContent: "space-between",
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
