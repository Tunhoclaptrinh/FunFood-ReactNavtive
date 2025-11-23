import React from "react";
import {TouchableOpacity, Text, ActivityIndicator, View} from "react-native";
import {ButtonProps} from "./types";
import {Ionicons} from "@expo/vector-icons";
import {COLORS} from "@/src/styles/colors";
import {styles} from "./styles";

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
  size = "medium",
  leftIcon,
  rightIcon,
  iconSize,
  containerStyle,
  buttonStyle,
  textStyle,
  fullWidth = false,
}) => {
  const isDisabled = disabled || loading;

  // Determine icon size based on button size
  const getIconSize = () => {
    if (iconSize) return iconSize;
    switch (size) {
      case "small":
        return 16;
      case "large":
        return 24;
      default:
        return 20;
    }
  };

  // Get text color based on variant
  const getTextColor = () => {
    if (isDisabled) {
      return variant === "outline" || variant === "ghost" ? COLORS.GRAY : "rgba(255,255,255,0.5)";
    }

    switch (variant) {
      case "outline":
      case "ghost":
        return COLORS.PRIMARY;
      case "danger":
        return COLORS.WHITE;
      default:
        return COLORS.WHITE;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[`${variant}Button`],
        styles[`${size}Size`],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabledButton,
        isDisabled && styles[`${variant}Disabled`],
        buttonStyle,
        containerStyle,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "outline" || variant === "ghost" ? COLORS.PRIMARY : COLORS.WHITE}
          size="small"
        />
      ) : (
        <View style={styles.content}>
          {leftIcon && <Ionicons name={leftIcon} size={getIconSize()} color={getTextColor()} style={styles.leftIcon} />}

          <Text
            style={[
              styles.text,
              styles[`${variant}Text`],
              styles[`${size}Text`],
              isDisabled && styles.disabledText,
              {color: getTextColor()},
              textStyle,
            ]}
          >
            {title}
          </Text>

          {rightIcon && (
            <Ionicons name={rightIcon} size={getIconSize()} color={getTextColor()} style={styles.rightIcon} />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

export default Button;
