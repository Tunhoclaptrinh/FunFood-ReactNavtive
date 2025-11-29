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
import styles from "./styles";

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
      newErrors.name = "Tên là bắt buộc";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Tên phải có ít nhất 2 ký tự";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Số điện thoại là bắt buộc";
    } else if (!/^(0|\+84)[0-9]{9}$/.test(formData.phone)) {
      newErrors.phone = "Định dạng số điện thoại không hợp lệ";
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
    Alert.alert("Thay đổi ảnh đại diện", "Chọn một tùy chọn", [
      { text: "Chụp ảnh", onPress: handleTakePhoto },
      { text: "Chọn từ thư viện", onPress: handlePickImage },
      { text: "Hủy", style: "cancel" },
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
          <Text style={styles.avatarHint}>Nhấn để đổi ảnh đại diện</Text>
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
                {/* <Text style={styles.readonlyBadgeText}>Verified</Text> */}
                <Text style={styles.readonlyBadgeText}>Đã xác thực</Text>
              </View>
            </View>
          </View>

          {/* Name */}
          <View style={styles.inputContainer}>
            <View style={styles.labelContainer}>
              <Ionicons name="person-outline" size={20} color={COLORS.GRAY} />
              <Text style={styles.label}>Họ và tên *</Text>
            </View>
            <Input
              value={formData.name}
              onChangeText={(name) => setFormData({...formData, name})}
              placeholder="Nhập họ tên của bạn"
              error={errors.name}
              containerStyle={styles.input}
            />
          </View>

          {/* Phone */}
          <View style={styles.inputContainer}>
            <View style={styles.labelContainer}>
              <Ionicons name="call-outline" size={20} color={COLORS.GRAY} />
              <Text style={styles.label}>Số điện thoại *</Text>
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
              <Text style={styles.label}>Địa chỉ</Text>
            </View>
            <Input
              value={formData.address}
              onChangeText={(address) => setFormData({...formData, address})}
              placeholder="Nhập địa chỉ của bạn"
              multiline
              numberOfLines={3}
              containerStyle={styles.input}
            />
          </View>

          {/* Required Fields Note */}
          <View style={styles.noteContainer}>
            <Ionicons name="information-circle-outline" size={16} color={COLORS.INFO} />
            <Text style={styles.noteText}>Các trường có dấu * là bắt buộc</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.bottomButtons}>
        <Button
          title="Hủy"
          onPress={() => {
            if (hasChanges()) {
              Alert.alert(
                "Bỏ thay đổi?",
                "Bạn có các thay đổi chưa lưu. Bạn có chắc muốn bỏ chúng không?",
                [
                  {text: "Tiếp tục chỉnh sửa", style: "cancel"},
                  {text: "Bỏ", onPress: () => navigation.goBack(), style: "destructive"},
                ]
              );
            } else {
              navigation.goBack();
            }
          }}
          variant="outline"
          containerStyle={styles.actionButton}
        />

        <Button
          title={loading ? "Đang lưu..." : "Lưu thay đổi"}
          onPress={handleSave}
          loading={loading}
          disabled={loading || !hasChanges()}
          containerStyle={styles.actionButton}
        />
      </View>
    </SafeAreaView>
  );
};

export default EditProfileScreen;
