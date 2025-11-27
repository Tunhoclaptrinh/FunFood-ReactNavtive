import React from "react";
import {SafeAreaView as RNSafeAreaView} from "react-native-safe-area-context";
import {ViewStyle, StyleSheet} from "react-native";
import {COLORS} from "@/src/styles/colors";

interface SafeAreaWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  edges?: ("top" | "right" | "bottom" | "left")[];
}

const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({children, style, edges = ["top", "bottom"]}) => {
  return (
    <RNSafeAreaView style={[styles.container, style]} edges={edges}>
      {children}
    </RNSafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    marginTop: -25,
  },
});

// 👉 Export SafeAreaWrapper nhưng đặt tên export là SafeAreaView
export {SafeAreaWrapper as SafeAreaView};

// 👉 Vẫn export default nếu bạn muốn (tuỳ bạn)
export default SafeAreaWrapper;
