import {StyleSheet} from "react-native";

export const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F1F1",
    borderRadius: 8,
    paddingHorizontal: 12,
    flex: 1,
    borderWidth: 2,
    borderColor: "transparent",
  },
  containerFocused: {
    backgroundColor: "#FFFFFF",
    borderColor: "#007AFF",
  },
  containerDisabled: {
    backgroundColor: "#E5E5E5",
    opacity: 0.6,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: "100%",
    paddingVertical: 0,
    textAlignVertical: "center",
    color: "#000",
  },
});
