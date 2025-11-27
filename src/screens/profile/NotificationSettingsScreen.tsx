import React, {useState, useEffect} from "react";
import {View, ScrollView, StyleSheet, Text, Switch, TouchableOpacity, Alert} from "react-native";
import SafeAreaView from "@/src/components/common/SafeAreaView";
import {Ionicons} from "@expo/vector-icons";
import Button from "@/src/components/common/Button";
import {COLORS} from "@/src/styles/colors";

const NotificationSettingsScreen = ({navigation}: any) => {
  const [settings, setSettings] = useState({
    pushNotifications: true,
    orderUpdates: true,
    promotions: true,
    newRestaurants: false,
    emailNotifications: true,
    smsNotifications: false,
  });
  const [loading, setLoading] = useState(false);

  const handleToggle = (key: keyof typeof settings) => {
    setSettings({...settings, [key]: !settings[key]});
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // TODO: API call to save settings
      await new Promise((resolve) => setTimeout(resolve, 1000));
      Alert.alert("Success", "Notification preferences saved");
    } catch (error) {
      Alert.alert("Error", "Failed to save preferences");
    } finally {
      setLoading(false);
    }
  };

  const settingsGroups = [
    {
      title: "Push Notifications",
      items: [
        {
          key: "pushNotifications" as const,
          icon: "notifications",
          label: "Enable Push Notifications",
          subtitle: "Receive notifications on your device",
        },
        {
          key: "orderUpdates" as const,
          icon: "receipt",
          label: "Order Updates",
          subtitle: "Get notified about your order status",
        },
        {
          key: "promotions" as const,
          icon: "pricetag",
          label: "Promotions & Offers",
          subtitle: "Receive special deals and discounts",
        },
        {
          key: "newRestaurants" as const,
          icon: "storefront",
          label: "New Restaurants",
          subtitle: "Get notified when new restaurants join",
        },
      ],
    },
    {
      title: "Other Channels",
      items: [
        {
          key: "emailNotifications" as const,
          icon: "mail",
          label: "Email Notifications",
          subtitle: "Receive updates via email",
        },
        {
          key: "smsNotifications" as const,
          icon: "chatbubble",
          label: "SMS Notifications",
          subtitle: "Receive text message updates",
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Manage how you receive notifications</Text>
        </View>

        {settingsGroups.map((group, groupIndex) => (
          <View key={groupIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{group.title}</Text>

            {group.items.map((item, index) => (
              <View key={item.key} style={styles.settingItem}>
                <View style={styles.settingIcon}>
                  <Ionicons name={item.icon as any} size={22} color={COLORS.PRIMARY} />
                </View>

                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>{item.label}</Text>
                  <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                </View>

                <Switch
                  value={settings[item.key]}
                  onValueChange={() => handleToggle(item.key)}
                  trackColor={{false: "#E5E7EB", true: COLORS.PRIMARY}}
                  thumbColor={COLORS.WHITE}
                />
              </View>
            ))}
          </View>
        ))}

        <View style={styles.noteContainer}>
          <Ionicons name="information-circle-outline" size={20} color={COLORS.INFO} />
          <Text style={styles.noteText}>
            You can change these settings anytime. Some notifications may be required for order updates.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button title="Save Preferences" onPress={handleSave} loading={loading} containerStyle={styles.button} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: COLORS.WHITE,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.DARK,
    marginBottom: 8,
    alignContent: "center",
  },
  section: {
    marginTop: 16,
    backgroundColor: COLORS.WHITE,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.GRAY,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
  },
  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFE5E5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.DARK,
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 12,
    color: COLORS.GRAY,
  },
  noteContainer: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#E3F2FD",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.INFO,
    lineHeight: 20,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  button: {
    width: "100%",
  },
});

export default NotificationSettingsScreen;
