import React from "react";
import {View, Text, StyleSheet, ViewStyle} from "react-native";
import {Ionicons} from "@expo/vector-icons";

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
  containerStyle?: ViewStyle;
}

const EmptyState: React.FC<EmptyStateProps> = ({icon = "sad-outline", title, subtitle, containerStyle}) => (
  <View style={[styles.container, containerStyle]}>
    <Ionicons name={icon as any} size={48} color="#9CA3AF" style={styles.icon} />
    <Text style={styles.title}>{title}</Text>
    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
  },
});

export default EmptyState;
