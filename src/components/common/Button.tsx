import React from "react";
import {TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle} from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "outline";
  size?: "small" | "medium" | "large";
  containerStyle?: ViewStyle; // ⭐ spacing, width
  buttonStyle?: ViewStyle; // ⭐ màu, border
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
  size = "medium",
  containerStyle,
  buttonStyle,
  textStyle,
}) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.button, // base
        styles[`${variant}Button`], // variant
        styles[`${size}Size`], // size
        buttonStyle, // override màu sắc (không ảnh hưởng padding)
        containerStyle, // override layout (width, margin)
        isDisabled && styles.disabledButton,
      ]}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`], textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    backgroundColor: "#FF6B6B",
  },
  secondaryButton: {
    backgroundColor: "#4ECDC4",
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: "#FF6B6B",
  },
  disabledButton: {
    opacity: 0.5,
  },
  smallSize: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  mediumSize: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  largeSize: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
  primaryText: {
    color: "#fff",
  },
  secondaryText: {
    color: "#fff",
  },
  outlineText: {
    color: "#FF6B6B",
  },
});

export default Button;
