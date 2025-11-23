import {Ionicons} from "@expo/vector-icons";
import {ViewStyle} from "react-native";

type IconName = keyof typeof Ionicons.glyphMap;

export interface EmptyStateProps {
  // Icon
  icon?: IconName;
  iconSize?: number;
  iconColor?: string;

  // Content
  title: string;
  subtitle?: string;

  // Actions
  primaryAction?: {
    label: string;
    onPress: () => void;
    leftIcon?: IconName;
  };
  secondaryAction?: {
    label: string;
    onPress: () => void;
  };

  // Custom content
  customContent?: React.ReactNode;

  // Variants
  variant?: "default" | "error" | "search" | "loading";

  // Styles
  containerStyle?: ViewStyle;
}
