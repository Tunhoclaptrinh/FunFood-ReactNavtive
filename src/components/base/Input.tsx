import React from "react";
import {TextInput, View, Text, StyleSheet, TextInputProps} from "react-native";
import {colors} from "@constants/colors";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({label, error, style, ...props}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput style={[styles.input, error && styles.inputError, style]} placeholderTextColor="#999" {...props} />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
    fontSize: 14,
    fontWeight: "600",
    color: colors.dark,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#000",
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 4,
  },
});
