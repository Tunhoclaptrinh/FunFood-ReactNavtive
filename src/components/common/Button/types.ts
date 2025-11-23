import {Ionicons} from "@expo/vector-icons";
import {ViewStyle, TextStyle} from "react-native";

export interface ButtonProps {
  title: string;
  onPress: () => void;

  // States
  loading?: boolean;
  disabled?: boolean;

  // Variants
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "small" | "medium" | "large";

  // Icons
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  iconSize?: number;

  // Styles
  containerStyle?: ViewStyle;
  buttonStyle?: ViewStyle;
  textStyle?: TextStyle;

  // Full width
  fullWidth?: boolean;
}
