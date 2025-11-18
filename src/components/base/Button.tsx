import React from "react";
import {TouchableOpacity, Text, StyleSheet} from "react-native";
import {colors} from "@constants/colors";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
}) => {
  const backgroundColor =
    variant === "primary" ? colors.primary : variant === "secondary" ? colors.secondary : colors.danger;

  return (
    <TouchableOpacity
      style={[styles.button, {backgroundColor, opacity: disabled ? 0.5 : 1}]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      <Text style={styles.text}>{loading ? "Loading..." : title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  text: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
