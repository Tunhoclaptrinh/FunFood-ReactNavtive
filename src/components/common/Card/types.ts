import {ImageStyle, ViewStyle} from "react-native";

export interface CardProps {
  // Image
  image?: string;
  imageHeight?: number;
  imageStyle?: ImageStyle;

  // Content
  title: string;
  subtitle?: string;
  description?: string;

  // Metadata
  rating?: number;
  badge?: string;
  badgeColor?: string;

  // Footer
  footer?: React.ReactNode;

  // Actions
  onPress?: () => void;
  onLongPress?: () => void;

  // Variants
  variant?: "default" | "horizontal" | "minimal";

  // Styles
  style?: ViewStyle;
  contentStyle?: ViewStyle;

  // Loading
  loading?: boolean;
}
