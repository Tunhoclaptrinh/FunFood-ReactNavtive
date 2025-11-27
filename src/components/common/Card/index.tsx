import React from "react";
import {View, TouchableOpacity, Image, Text} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {COLORS} from "@/src/styles/colors";
import {CardProps} from "./types";
import {styles} from "./styles";

const Card: React.FC<CardProps> = ({
  image,
  imageHeight = 160,
  imageStyle,
  title,
  subtitle,
  description,
  rating,
  badge,
  badgeColor = COLORS.PRIMARY,
  footer,
  onPress,
  onLongPress,
  variant = "default",
  style,
  contentStyle,
  loading = false,
}) => {
  const Component = onPress ? TouchableOpacity : View;

  const variantCardStyle =
    variant === "horizontal" ? styles.horizontalCard : variant === "minimal" ? styles.minimalCard : undefined;

  // Skeleton loading
  if (loading) {
    return (
      <View style={[styles.card, variantCardStyle, style]}>
        {variant !== "minimal" && <View style={[styles.skeleton, styles.skeletonImage, {height: imageHeight}]} />}
        <View style={[styles.content, contentStyle]}>
          <View style={[styles.skeleton, styles.skeletonTitle]} />
          <View style={[styles.skeleton, styles.skeletonSubtitle]} />
          {description && <View style={[styles.skeleton, styles.skeletonDescription]} />}
        </View>
      </View>
    );
  }

  // Horizontal variant
  if (variant === "horizontal") {
    return (
      <Component
        style={[styles.card, styles.horizontalCard, style]}
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.7}
      >
        {image && (
          <View style={styles.horizontalImageContainer}>
            <Image source={{uri: image}} style={[styles.horizontalImage, imageStyle]} resizeMode="cover" />
            {badge && (
              <View style={[styles.badge, {backgroundColor: badgeColor}]}>
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            )}
          </View>
        )}

        <View style={[styles.horizontalContent, contentStyle]}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>

          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}

          {description && (
            <Text style={styles.description} numberOfLines={2}>
              {description}
            </Text>
          )}

          {rating !== undefined && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color={COLORS.WARNING} />
              <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
            </View>
          )}

          {footer}
        </View>
      </Component>
    );
  }

  // Minimal variant
  if (variant === "minimal") {
    return (
      <Component
        style={[styles.card, styles.minimalCard, style]}
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.7}
      >
        <View style={[styles.content, contentStyle]}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>

          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}

          {rating !== undefined && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color={COLORS.WARNING} />
              <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
            </View>
          )}
        </View>
      </Component>
    );
  }

  // Default variant (vertical)
  return (
    <Component style={[styles.card, style]} onPress={onPress} onLongPress={onLongPress} activeOpacity={0.7}>
      {image && (
        <View style={[styles.imageContainer, {height: imageHeight}]}>
          <Image source={{uri: image}} style={[styles.image, imageStyle]} resizeMode="cover" />

          {badge && (
            <View style={[styles.badge, {backgroundColor: badgeColor}]}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}

          {rating !== undefined && (
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={12} color={COLORS.WARNING} />
              <Text style={styles.ratingBadgeText}>{rating.toFixed(1)}</Text>
            </View>
          )}
        </View>
      )}

      <View style={[styles.content, contentStyle]}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>

        {subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}

        {description && (
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
        )}

        {footer}
      </View>
    </Component>
  );
};

export default Card;
