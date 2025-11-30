import React, {useState} from "react";
import {View, ScrollView, TouchableOpacity, Alert, Image, Text} from "react-native";
import SafeAreaView from "@/src/components/common/SafeAreaView";
import {Ionicons} from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import {useAuth} from "@hooks/useAuth";
import {useAuthStore} from "@stores/authStore";
import {apiClient} from "@config/api.client";
import {API_CONFIG} from "@config/api.config";
import Input from "@/src/components/common/Input/Input";
import Button from "@/src/components/common/Button";
import {COLORS} from "@/src/styles/colors";
import styles from "./styles";
import {getImageUrl} from "@/src/utils/formatters";

const EditProfileScreen = ({navigation}: any) => {
  const {user, token, refreshUser} = useAuth();
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
    if (!formData.name.trim()) newErrors.name = "Tên là bắt buộc";
    if (!formData.phone.trim()) newErrors.phone = "Số điện thoại là bắt buộc";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setFormData({...formData, avatar: result.assets[0].uri});
    }
  };

  const handleTakePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setFormData({...formData, avatar: result.assets[0].uri});
    }
  };

  const handleAvatarPress = () => {
    Alert.alert("Thay đổi ảnh đại diện", "Chọn một tùy chọn", [
      {text: "Chụp ảnh", onPress: handleTakePhoto},
      {text: "Chọn từ thư viện", onPress: handlePickImage},
      {text: "Hủy", style: "cancel"},
    ]);
  };

  // --- HÀM SAVE ĐÃ SỬA LỖI ---
  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      let updatedUser = {...user};

      // 1. Cập nhật thông tin văn bản
      const updateData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
      };
      const textRes = await apiClient.put("/users/profile", updateData);
      if (textRes.data) {
        updatedUser = {...updatedUser, ...textRes.data};
      } else {
        updatedUser = {...updatedUser, ...updateData};
      }

      // 2. Upload Avatar (QUAN TRỌNG: Đã bỏ Content-Type thủ công)
      const isNewImage = formData.avatar && !formData.avatar.startsWith("http");
      if (isNewImage) {
        const uploadData = new FormData();
        const uriParts = formData.avatar.split(".");
        const fileType = uriParts[uriParts.length - 1];

        uploadData.append("image", {
          uri: formData.avatar,
          name: `avatar.${fileType}`,
          type: `image/${fileType === "png" ? "png" : "jpeg"}`,
        } as any);

        // Gửi request bằng fetch
        const uploadRes = await fetch(`${API_CONFIG.BASE_URL}/upload/avatar`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            // ❌ KHÔNG ĐƯỢC CÓ DÒNG NÀY: "Content-Type": "multipart/form-data",
          },
          body: uploadData,
        });

        const uploadJson = await uploadRes.json();

        if (uploadJson.success && uploadJson.data?.user) {
          // Server trả về user mới có link avatar
          updatedUser = uploadJson.data.user;
        } else {
          throw new Error(uploadJson.message || "Upload ảnh thất bại");
        }
      }

      // 3. Cập nhật Store ngay lập tức để UI đổi
      const {setUser: setStoreUser} = useAuthStore.getState();
      if (token) {
        await setStoreUser(updatedUser as any, token);
      }

      // Gọi refresh ngầm để đồng bộ chắc chắn
      if (refreshUser) refreshUser();

      Alert.alert("Thành công", "Cập nhật hồ sơ thành công", [{text: "OK", onPress: () => navigation.goBack()}]);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      Alert.alert("Lỗi", error.message || "Không thể cập nhật hồ sơ");
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
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <TouchableOpacity style={styles.avatarContainer} onPress={handleAvatarPress}>
            {/* Sử dụng getImageUrl để hiển thị đúng cả ảnh local và ảnh server */}
            {formData.avatar ? (
              <Image source={{uri: getImageUrl(formData.avatar)}} style={styles.avatar} />
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

        <View style={styles.formSection}>
          <View style={styles.inputContainer}>
            <View style={styles.labelContainer}>
              <Ionicons name="mail-outline" size={20} color={COLORS.GRAY} />
              <Text style={styles.label}>Email</Text>
            </View>
            <View style={styles.readonlyInput}>
              <Text style={styles.readonlyText}>{user?.email}</Text>
              <View style={styles.readonlyBadge}>
                <Text style={styles.readonlyBadgeText}>Đã xác thực</Text>
              </View>
            </View>
          </View>

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
        </View>
      </ScrollView>

      <View style={styles.bottomButtons}>
        <Button
          title="Hủy"
          onPress={() => navigation.goBack()}
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
