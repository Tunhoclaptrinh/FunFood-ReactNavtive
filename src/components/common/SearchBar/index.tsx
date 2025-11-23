import React, {useState, useEffect, useRef, useCallback} from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
  Keyboard,
} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {SearchBarProps} from "./types";
import {styles} from "./styles";

const SIZE_MAP = {
  small: {height: 35, fontSize: 14, iconSize: 18},
  medium: {height: 45, fontSize: 16, iconSize: 20},
  large: {height: 55, fontSize: 18, iconSize: 24},
};

const SearchBar: React.FC<SearchBarProps> = ({
  value = "",
  onChangeText,
  onClear,
  onSubmit,
  onFocus,
  onBlur,
  placeholder = "Search...",
  debounceDelay = 300,
  containerStyle,
  inputStyle,
  iconColor = "#666",
  size = "medium",
  returnKeyType = "search",
  searchMode = "both",
  autoFocus = false,
  editable = true,
  maxLength,
  minSearchLength = 0,
  showClearButton = true,
  disableFocusOnMount = false,
  showFocusBorder = false,
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const previousValueRef = useRef(value);
  const inputRef = useRef<TextInput>(null);

  // Sync when parent value changes
  useEffect(() => {
    setInternalValue(value);
    previousValueRef.current = value;
  }, [value]);

  // Debounce effect
  useEffect(() => {
    if (searchMode === "onSubmit") return;
    if (internalValue === previousValueRef.current) return;

    // Kiểm tra độ dài tối thiểu
    if (internalValue.length > 0 && internalValue.length < minSearchLength) return;

    const handler = setTimeout(() => {
      onChangeText?.(internalValue);
      previousValueRef.current = internalValue;
    }, debounceDelay);

    return () => clearTimeout(handler);
  }, [internalValue, debounceDelay, onChangeText, searchMode, minSearchLength]);

  // Focus on mount if autoFocus && !disableFocusOnMount
  useEffect(() => {
    if (autoFocus && !disableFocusOnMount) {
      inputRef.current?.focus();
    }
  }, [autoFocus, disableFocusOnMount]);

  const handleClear = useCallback(() => {
    setInternalValue("");
    previousValueRef.current = "";
    onClear?.();
    inputRef.current?.focus();
  }, [onClear]);

  const handleSubmit = useCallback(() => {
    if (searchMode === "onChange") return;

    if (internalValue.length > 0 && internalValue.length < minSearchLength) return;

    if (internalValue !== previousValueRef.current || searchMode === "onSubmit") {
      onSubmit?.(internalValue);
      previousValueRef.current = internalValue;
    }

    Keyboard.dismiss();
  }, [internalValue, onSubmit, searchMode, minSearchLength]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    onFocus?.();
  }, [onFocus]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    onBlur?.();
  }, [onBlur]);

  const focus = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const blur = useCallback(() => {
    inputRef.current?.blur();
  }, []);

  const sizeStyle = SIZE_MAP[size] || SIZE_MAP.medium;

  return (
    <View
      style={[
        styles.container,
        {height: sizeStyle.height},
        isFocused && showFocusBorder && styles.containerFocused, // <-- dùng prop
        !editable && styles.containerDisabled,
        containerStyle,
      ]}
    >
      <Ionicons name="search" size={sizeStyle.iconSize} color={iconColor} style={styles.searchIcon} />
      <TextInput
        ref={inputRef}
        style={[styles.input, {fontSize: sizeStyle.fontSize}, inputStyle]}
        placeholder={placeholder}
        placeholderTextColor="#999"
        value={internalValue}
        onChangeText={setInternalValue}
        onSubmitEditing={handleSubmit}
        onFocus={handleFocus}
        onBlur={handleBlur}
        returnKeyType={returnKeyType}
        clearButtonMode="never"
        autoFocus={autoFocus}
        editable={editable}
        maxLength={maxLength}
        autoCapitalize="none"
        autoCorrect={false}
        selectionColor={iconColor}
        underlineColorAndroid="transparent"
      />
      {showClearButton && internalValue.length > 0 && (
        <TouchableOpacity
          onPress={handleClear}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          activeOpacity={0.7}
        >
          <Ionicons name="close-circle" size={sizeStyle.iconSize} color="#999" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SearchBar;
