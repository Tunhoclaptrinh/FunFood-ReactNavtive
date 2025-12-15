import React from "react";
import {View, Text, StyleSheet, ViewStyle} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import Button from "../Button"; // Import enhanced Button
import {styles} from "./styles";
import {EmptyStateProps} from "./types";
import {COLORS} from "@/src/styles/colors";

type IconName = keyof typeof Ionicons.glyphMap;

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = "alert-circle-outline",
  iconSize = 64,
  iconColor,
  title,
  subtitle,
  primaryAction,
  secondaryAction,
  customContent,
  variant = "default",
  containerStyle,
}) => {
  // Get icon and color based on variant
  const getVariantConfig = (): {icon: IconName; color: string} => {
    switch (variant) {
      case "error":
        return {
          icon: "alert-circle-outline" as IconName,
          color: COLORS.ERROR,
        };
      case "search":
        return {
          icon: "search-outline" as IconName,
          color: COLORS.GRAY,
        };
      case "loading":
        return {
          icon: "hourglass-outline" as IconName,
          color: COLORS.PRIMARY,
        };
      default:
        return {
          icon: icon as IconName,
          color: iconColor || COLORS.GRAY,
        };
    }
  };

  const config = getVariantConfig();

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Icon */}
      <View style={[styles.iconContainer, {backgroundColor: config.color + "20"}]}>
        <Ionicons name={config.icon} size={iconSize} color={config.color} />
      </View>

      {/* Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Subtitle */}
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

      {/* Custom Content */}
      {customContent && <View style={styles.customContent}>{customContent}</View>}

      {/* Actions */}
      {(primaryAction || secondaryAction) && (
        <View style={styles.actionsContainer}>
          {primaryAction && (
            <Button
              title={primaryAction.label}
              onPress={primaryAction.onPress}
              leftIcon={primaryAction.leftIcon}
              size="medium"
              buttonStyle={styles.primaryAction}
            />
          )}

          {secondaryAction && (
            <Button
              title={secondaryAction.label}
              onPress={secondaryAction.onPress}
              variant="outline"
              size="medium"
              buttonStyle={styles.secondaryAction}
            />
          )}
        </View>
      )}
    </View>
  );
};

export default EmptyState;

// Usage Examples:
/*

// 1. Basic Empty State
<EmptyState
  icon="mail-outline"
  title="No items found"
  subtitle="Start adding items to see them here"
/>

// 2. With Actions
<EmptyState
  icon="cart-outline"
  title="Your cart is empty"
  subtitle="Add some delicious food to your cart"
  primaryAction={{
    label: "Start Shopping",
    onPress: () => navigation.navigate("Home"),
    leftIcon: "storefront-outline",
  }}
  secondaryAction={{
    label: "View Deals",
    onPress: () => navigation.navigate("Deals"),
  }}
/>

// 3. Error State
<EmptyState
  variant="error"
  title="Something went wrong"
  subtitle="We couldn't load your data. Please try again."
  primaryAction={{
    label: "Retry",
    onPress: () => refetch(),
    leftIcon: "refresh-outline",
  }}
/>

// 4. Search Empty State
<EmptyState
  variant="search"
  title={`No results for "${searchQuery}"`}
  subtitle="Try different keywords or check your spelling"
  primaryAction={{
    label: "Clear Search",
    onPress: () => setSearchQuery(""),
  }}
/>

// 5. With Custom Content
<EmptyState
  icon="heart-outline"
  title="No favorites yet"
  subtitle="Save your favorite restaurants and products"
  customContent={
    <View style={{ alignItems: "center" }}>
      <Image 
        source={require("./empty-favorites.png")} 
        style={{ width: 200, height: 150 }}
      />
    </View>
  }
  primaryAction={{
    label: "Explore Restaurants",
    onPress: () => navigation.navigate("Home"),
  }}
/>

*/
