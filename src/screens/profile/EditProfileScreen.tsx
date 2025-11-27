import React, {useState, useEffect} from "react";
import {View, ScrollView, StyleSheet, Text, TouchableOpacity, Alert, ActivityIndicator, Image} from "react-native";
import SafeAreaView from "@/src/components/common/SafeAreaView";
import {Ionicons} from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import {useAuth} from "@hooks/useAuth";
import {apiClient} from "@config/api.client";
import Input from "@/src/components/common/Input/Input";
import Button from "@/src/components/common/Button";
import {COLORS} from "@/src/styles/colors";

const EditProfileScreen = ({navigation}: any) => {
  const {user} = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
    avatar: user?.avatar || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required";
    } else if (!/^(0|\+84)[0-9]{9}$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone number format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePickImage = async () => {
    try {
      const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Permission Denied", "We need camera roll permissions to change your avatar");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setFormData({...formData, avatar: result.assets[0].uri});
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleTakePhoto = async () => {
    try {
      const {status} = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Permission Denied", "We need camera permissions to take a photo");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setFormData({...formData, avatar: result.assets[0].uri});
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo");
    }
  };

  const handleAvatarPress = () => {
    Alert.alert("Change Avatar", "Choose an option", [
      {text: "Take Photo", onPress: handleTakePhoto},
      {text: "Choose from Library", onPress: handlePickImage},
      {text: "Cancel", style: "cancel"},
    ]);
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Prepare data to send
      const updateData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
      };

      // If avatar is local URI, upload it first
      // For now, we'll just send the data without avatar
      // In production, you'd upload the image to a server first

      await apiClient.put("/users/profile", updateData);

      Alert.alert("Success", "Profile updated successfully", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = () => {
    return (
      formData.name !== user?.name ||
      formData.phone !== user?.phone ||
      formData.address !== user?.address ||
      formData.avatar !== user?.avatar
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity style={styles.avatarContainer} onPress={handleAvatarPress} activeOpacity={0.7}>
            {formData.avatar ? (
              <Image source={{uri: formData.avatar}} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{formData.name?.charAt(0).toUpperCase() || "U"}</Text>
              </View>
            )}
            <View style={styles.cameraIconContainer}>
              <Ionicons name="camera" size={20} color={COLORS.WHITE} />
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>Tap to change photo</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          {/* Email (Read-only) */}
          <View style={styles.inputContainer}>
            <View style={styles.labelContainer}>
              <Ionicons name="mail-outline" size={20} color={COLORS.GRAY} />
              <Text style={styles.label}>Email</Text>
            </View>
            <View style={styles.readonlyInput}>
              <Text style={styles.readonlyText}>{user?.email}</Text>
              <View style={styles.readonlyBadge}>
                <Text style={styles.readonlyBadgeText}>Verified</Text>
              </View>
            </View>
          </View>

          {/* Name */}
          <View style={styles.inputContainer}>
            <View style={styles.labelContainer}>
              <Ionicons name="person-outline" size={20} color={COLORS.GRAY} />
              <Text style={styles.label}>Full Name *</Text>
            </View>
            <Input
              value={formData.name}
              onChangeText={(name) => setFormData({...formData, name})}
              placeholder="Enter your full name"
              error={errors.name}
              containerStyle={styles.input}
            />
          </View>

          {/* Phone */}
          <View style={styles.inputContainer}>
            <View style={styles.labelContainer}>
              <Ionicons name="call-outline" size={20} color={COLORS.GRAY} />
              <Text style={styles.label}>Phone Number *</Text>
            </View>
            <Input
              value={formData.phone}
              onChangeText={(phone) => setFormData({...formData, phone})}
              placeholder="0912345678"
              keyboardType="phone-pad"
              error={errors.phone}
              containerStyle={styles.input}
            />
          </View>

          {/* Address */}
          <View style={styles.inputContainer}>
            <View style={styles.labelContainer}>
              <Ionicons name="location-outline" size={20} color={COLORS.GRAY} />
              <Text style={styles.label}>Address</Text>
            </View>
            <Input
              value={formData.address}
              onChangeText={(address) => setFormData({...formData, address})}
              placeholder="Enter your address"
              multiline
              numberOfLines={3}
              containerStyle={styles.input}
            />
          </View>

          {/* Required Fields Note */}
          <View style={styles.noteContainer}>
            <Ionicons name="information-circle-outline" size={16} color={COLORS.INFO} />
            <Text style={styles.noteText}>Fields marked with * are required</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.bottomButtons}>
        <Button
          title="Cancel"
          onPress={() => {
            if (hasChanges()) {
              Alert.alert("Discard Changes?", "You have unsaved changes. Are you sure you want to discard them?", [
                {text: "Keep Editing", style: "cancel"},
                {
                  text: "Discard",
                  onPress: () => navigation.goBack(),
                  style: "destructive",
                },
              ]);
            } else {
              navigation.goBack();
            }
          }}
          variant="outline"
          containerStyle={styles.actionButton}
        />

        <Button
          title={loading ? "Saving..." : "Save Changes"}
          onPress={handleSave}
          loading={loading}
          disabled={loading || !hasChanges()}
          containerStyle={styles.actionButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 12,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: COLORS.WHITE,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: COLORS.WHITE,
  },
  avatarText: {
    fontSize: 48,
    fontWeight: "bold",
    color: COLORS.WHITE,
  },
  cameraIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: COLORS.WHITE,
  },
  avatarHint: {
    fontSize: 13,
    color: COLORS.GRAY,
    fontWeight: "500",
  },
  formSection: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.DARK,
  },
  input: {
    marginVertical: 0,
  },
  readonlyInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  readonlyText: {
    fontSize: 15,
    color: COLORS.GRAY,
  },
  readonlyBadge: {
    backgroundColor: COLORS.SUCCESS,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  readonlyBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.WHITE,
  },
  noteContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  noteText: {
    fontSize: 12,
    color: COLORS.INFO,
    flex: 1,
  },
  bottomButtons: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: COLORS.WHITE,
    borderTopWidth: 1,
    borderTopColor: COLORS.LIGHT_GRAY,
    elevation: 5,
    shadowColor: COLORS.BLACK,
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 1,
  },
});

export default EditProfileScreen;
