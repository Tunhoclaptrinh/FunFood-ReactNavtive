import React, {useState} from "react";
import {TextInput, View, Text, TouchableOpacity} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {COLORS} from "@/src/styles/colors";
import {InputProps} from "./types";
import {styles} from "./styles";

const Input: React.FC<InputProps> = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  editable = true,
  multiline = false,
  numberOfLines = 1,
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  required = false,
  maxLength,
  showCharCount = false,
  containerStyle,
  inputStyle,
  onFocus,
  onBlur,
  onSubmitEditing,
  autoFocus = false,
  autoCapitalize = "none",
  autoCorrect = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Determine border color
  const getBorderColor = () => {
    if (error) return COLORS.ERROR;
    if (isFocused) return COLORS.PRIMARY;
    return COLORS.BORDER;
  };

  // Get right icon (password toggle or custom)
  const getRightIcon = () => {
    if (secureTextEntry) {
      return showPassword ? "eye-outline" : "eye-off-outline";
    }
    return rightIcon;
  };

  const handleRightIconPress = () => {
    if (secureTextEntry) {
      togglePasswordVisibility();
    } else {
      onRightIconPress?.();
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Label */}
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
          {showCharCount && maxLength && (
            <Text style={styles.charCount}>
              {value.length}/{maxLength}
            </Text>
          )}
        </View>
      )}

      {/* Input Container */}
      <View
        style={[
          styles.inputContainer,
          {borderColor: getBorderColor()},
          !editable && styles.disabledInput,
          error && styles.errorInput,
          isFocused && styles.focusedInput,
          multiline && styles.multilineContainer,
        ]}
      >
        {/* Left Icon */}
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={error ? COLORS.ERROR : isFocused ? COLORS.PRIMARY : COLORS.GRAY}
            style={styles.leftIcon}
          />
        )}

        {/* Input */}
        <TextInput
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            (rightIcon || secureTextEntry) && styles.inputWithRightIcon,
            multiline && styles.multilineInput,
            inputStyle,
          ]}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          editable={editable}
          multiline={multiline}
          numberOfLines={numberOfLines}
          placeholderTextColor={COLORS.GRAY}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={onSubmitEditing}
          autoFocus={autoFocus}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          maxLength={maxLength}
          selectionColor={COLORS.PRIMARY}
        />

        {/* Right Icon */}
        {(rightIcon || secureTextEntry) && (
          <TouchableOpacity
            onPress={handleRightIconPress}
            disabled={!secureTextEntry && !onRightIconPress}
            style={styles.rightIconButton}
          >
            <Ionicons
              name={getRightIcon() as any}
              size={20}
              color={error ? COLORS.ERROR : isFocused ? COLORS.PRIMARY : COLORS.GRAY}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Helper Text / Error */}
      {(error || helperText) && (
        <View style={styles.bottomTextContainer}>
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={14} color={COLORS.ERROR} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          {!error && helperText && <Text style={styles.helperText}>{helperText}</Text>}
        </View>
      )}
    </View>
  );
};

export default Input;
