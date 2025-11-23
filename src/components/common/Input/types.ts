import {Ionicons} from "@expo/vector-icons";
import {TextStyle, ViewStyle} from "react-native";

export interface InputProps {
  // Basic
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;

  // Types
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;

  // Labels & Errors
  label?: string;
  error?: string;
  helperText?: string;

  // Icons
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;

  // Validation
  required?: boolean;
  maxLength?: number;
  showCharCount?: boolean;

  // Styles
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;

  // Events
  onFocus?: () => void;
  onBlur?: () => void;
  onSubmitEditing?: () => void;

  // Auto features
  autoFocus?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: boolean;
}
