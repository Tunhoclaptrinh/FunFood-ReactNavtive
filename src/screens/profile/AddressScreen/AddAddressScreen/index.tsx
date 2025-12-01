import React, {useState, useEffect} from "react";
import {View, ScrollView, StyleSheet, Text, TouchableOpacity, Alert, Switch} from "react-native";
import SafeAreaView from "@/src/components/common/SafeAreaView";
import {Ionicons} from "@expo/vector-icons";
import {useGeolocation} from "@hooks/useGeolocation";
import Input from "@/src/components/common/Input/Input";
import Button from "@/src/components/common/Button";
import {COLORS} from "@/src/styles/colors";
import {AddressService, CreateAddressRequest} from "@/src/services/address.service";
import styles from "./styles";

const PRESET_LABELS = [
  {label: "Nhà riêng", icon: "home"},
  {label: "Công ty", icon: "business"},
  {label: "Khác", icon: "pencil"},
];

const AddAddressScreen = ({route, navigation}: any) => {
  const existingAddress = route.params?.address;
  const isEdit = !!existingAddress;
  const {location, requestLocation} = useGeolocation();
  const [loading, setLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Nếu existing label là preset -> chọn preset; nếu không -> chọn "Khác" và điền customLabel
  const initialSelectedPreset =
    existingAddress?.label && PRESET_LABELS.some((p) => p.label === existingAddress.label)
      ? existingAddress.label
      : existingAddress?.label
      ? "Khác"
      : null;

  const [selectedPreset, setSelectedPreset] = useState<string | null>(initialSelectedPreset ?? null);

  const [customLabel, setCustomLabel] = useState<string>(
    existingAddress?.label && !PRESET_LABELS.some((p) => p.label === existingAddress.label) ? existingAddress.label : ""
  );

  const [formData, setFormData] = useState({
    address: existingAddress?.address || "",
    recipientName: existingAddress?.recipientName || "",
    recipientPhone: existingAddress?.recipientPhone || "",
    note: existingAddress?.note || "",
    latitude: existingAddress?.latitude || null,
    longitude: existingAddress?.longitude || null,
    isDefault: existingAddress?.isDefault || false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isEdit && location) {
      setFormData((prev) => ({
        ...prev,
        latitude: location.latitude,
        longitude: location.longitude,
      }));
    }
  }, [location, isEdit]);

  const handlePresetSelect = (label: string) => {
    if (label === "Khác") {
      // Chuyển sang chế độ custom: giữ customLabel hiện tại (nếu có)
      setSelectedPreset("Khác");
      return;
    }

    // Chọn preset khác: clear customLabel và chọn preset
    setSelectedPreset(label);
    setCustomLabel("");
  };

  const getCurrentLabel = () => {
    if (selectedPreset && selectedPreset !== "Khác") return selectedPreset;
    if (selectedPreset === "Khác") return customLabel.trim();
    // không chọn gì
    return customLabel.trim();
  };

  const validateForm = () => {
    const label = getCurrentLabel();
    const addressData: CreateAddressRequest = {
      label,
      address: formData.address.trim(),
      recipientName: formData.recipientName.trim(),
      recipientPhone: formData.recipientPhone.trim(),
      note: formData.note.trim() || undefined,
      latitude: formData.latitude || undefined,
      longitude: formData.longitude || undefined,
      isDefault: formData.isDefault,
    };

    const validation = AddressService.validateAddress(addressData);

    // Nếu user đang ở chế độ "Khác" hoặc chưa chọn preset thì custom label phải có giá trị
    if (selectedPreset === "Khác" && !customLabel.trim()) {
      validation.errors.label = "Vui lòng nhập nhãn địa chỉ";
      validation.isValid = false;
    }

    // Nếu chưa chọn preset và custom rỗng -> lỗi (không chọn nhãn)
    if (!selectedPreset && !customLabel.trim()) {
      validation.errors.label = "Vui lòng chọn hoặc nhập nhãn địa chỉ";
      validation.isValid = false;
    }

    setErrors(validation.errors);
    return validation.isValid;
  };

  const handleGetCurrentLocation = async () => {
    try {
      setLoadingLocation(true);
      await requestLocation();

      if (location) {
        setFormData((prev) => ({
          ...prev,
          latitude: location.latitude,
          longitude: location.longitude,
        }));
        Alert.alert("Thành công", "Đã lấy vị trí hiện tại");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể lấy vị trí hiện tại");
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const data: CreateAddressRequest = {
        label: getCurrentLabel(),
        address: formData.address.trim(),
        recipientName: formData.recipientName.trim(),
        recipientPhone: formData.recipientPhone.trim(),
        note: formData.note.trim() || undefined,
        latitude: formData.latitude || undefined,
        longitude: formData.longitude || undefined,
        isDefault: formData.isDefault,
      };

      if (isEdit) {
        await AddressService.updateAddress(existingAddress.id, data);
        Alert.alert("Thành công", "Đã cập nhật địa chỉ", [{text: "OK", onPress: () => navigation.goBack()}]);
      } else {
        await AddressService.createAddress(data);
        Alert.alert("Thành công", "Đã thêm địa chỉ mới", [{text: "OK", onPress: () => navigation.goBack()}]);
      }
    } catch (error: any) {
      console.error("Lỗi khi lưu địa chỉ:", error);
      Alert.alert("Lỗi", error.message || "Không thể lưu địa chỉ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerSubtitle}>
            {isEdit ? "Cập nhật thông tin địa chỉ giao hàng" : "Nhập thông tin địa chỉ giao hàng mới"}
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          {/* Label Selection */}
          <View style={styles.inputContainer}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Nhãn địa chỉ</Text>
              <Text style={styles.required}>*</Text>
            </View>

            <View style={styles.labelOptions}>
              {PRESET_LABELS.map((option) => {
                const isActive = selectedPreset === option.label;
                return (
                  <TouchableOpacity
                    key={option.label}
                    style={[styles.labelOption, isActive && styles.labelOptionActive]}
                    onPress={() => handlePresetSelect(option.label)}
                    activeOpacity={0.75}
                  >
                    <Ionicons name={option.icon as any} size={18} color={isActive ? COLORS.WHITE : COLORS.PRIMARY} />
                    <Text style={[styles.labelOptionText, isActive && styles.labelOptionTextActive]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Custom Label only visible when "Khác" selected */}
            {selectedPreset === "Khác" && (
              <Input
                value={customLabel}
                onChangeText={(text) => {
                  setCustomLabel(text);
                  // đảm bảo ở chế độ Khác khi gõ
                  if (selectedPreset !== "Khác") setSelectedPreset("Khác");
                }}
                placeholder="VD: Nhà bạn gái, Nhà bố mẹ..."
                maxLength={50}
                error={errors.label}
              />
            )}
          </View>

          {/* Recipient Name */}
          <View style={styles.inputContainer}>
            <View style={styles.labelRow}>
              <Ionicons name="person-outline" size={20} color={COLORS.GRAY} />
              <Text style={styles.label}>Tên người nhận</Text>
              <Text style={styles.required}>*</Text>
            </View>
            <Input
              value={formData.recipientName}
              onChangeText={(recipientName) => setFormData({...formData, recipientName})}
              placeholder="Nhập tên người nhận"
              error={errors.recipientName}
            />
          </View>

          {/* Phone Number */}
          <View style={styles.inputContainer}>
            <View style={styles.labelRow}>
              <Ionicons name="call-outline" size={20} color={COLORS.GRAY} />
              <Text style={styles.label}>Số điện thoại</Text>
              <Text style={styles.required}>*</Text>
            </View>
            <Input
              value={formData.recipientPhone}
              onChangeText={(recipientPhone) => setFormData({...formData, recipientPhone})}
              placeholder="0912345678"
              keyboardType="phone-pad"
              error={errors.recipientPhone}
            />
          </View>

          {/* Address */}
          <View style={styles.inputContainer}>
            <View style={styles.labelRow}>
              <Ionicons name="location-outline" size={20} color={COLORS.GRAY} />
              <Text style={styles.label}>Địa chỉ đầy đủ</Text>
              <Text style={styles.required}>*</Text>
            </View>
            <Input
              value={formData.address}
              onChangeText={(address) => setFormData({...formData, address})}
              placeholder="Nhập số nhà, tên đường, phường/xã, quận/huyện..."
              multiline
              numberOfLines={4}
              error={errors.address}
            />
          </View>

          {/* GPS Coordinates */}
          <View style={styles.inputContainer}>
            <View style={styles.labelRow}>
              <Ionicons name="navigate-outline" size={20} color={COLORS.GRAY} />
              <Text style={styles.label}>Vị trí GPS (Tùy chọn)</Text>
            </View>
            <View style={styles.gpsContainer}>
              <View style={styles.gpsInfo}>
                {formData.latitude && formData.longitude ? (
                  <>
                    <Text style={styles.gpsText}>
                      📍 {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                    </Text>
                    <Text style={styles.gpsSubtext}>Đã lưu tọa độ</Text>
                  </>
                ) : (
                  <Text style={styles.gpsPlaceholder}>Chưa có tọa độ GPS</Text>
                )}
              </View>
              <Button
                title={loadingLocation ? "Đang lấy..." : "Lấy vị trí"}
                onPress={handleGetCurrentLocation}
                variant="outline"
                size="small"
                loading={loadingLocation}
                disabled={loadingLocation}
                containerStyle={styles.gpsButton}
              />
            </View>
          </View>

          {/* Delivery Notes */}
          <View style={styles.inputContainer}>
            <View style={styles.labelRow}>
              <Ionicons name="chatbubble-outline" size={20} color={COLORS.GRAY} />
              <Text style={styles.label}>Ghi chú giao hàng (Tùy chọn)</Text>
            </View>
            <Input
              value={formData.note}
              onChangeText={(note) => setFormData({...formData, note})}
              placeholder="VD: Bấm chuông, Gọi điện khi đến..."
              multiline
              numberOfLines={2}
              error={errors.note}
            />
          </View>

          {/* Set as Default */}
          <View style={styles.defaultContainer}>
            <View style={styles.defaultInfo}>
              <Ionicons name="star" size={20} color={COLORS.WARNING} />
              <View style={styles.defaultText}>
                <Text style={styles.defaultTitle}>Đặt làm địa chỉ mặc định</Text>
                <Text style={styles.defaultSubtitle}>Sử dụng địa chỉ này làm mặc định khi đặt hàng</Text>
              </View>
            </View>
            <Switch
              value={formData.isDefault}
              onValueChange={(isDefault) => setFormData({...formData, isDefault})}
              trackColor={{false: "#E5E7EB", true: COLORS.PRIMARY}}
              thumbColor={COLORS.WHITE}
            />
          </View>

          {/* Required Fields Note */}
          <View style={styles.noteContainer}>
            <Ionicons name="information-circle-outline" size={16} color={COLORS.INFO} />
            <Text style={styles.noteText}>
              Các trường có dấu <Text style={styles.required}>*</Text> là bắt buộc
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.bottomButtons}>
        <Button
          title="Hủy"
          onPress={() => navigation.goBack()}
          variant="outline"
          containerStyle={styles.cancelButton}
        />
        <Button
          title={loading ? "Đang lưu..." : isEdit ? "Cập nhật" : "Thêm địa chỉ"}
          onPress={handleSave}
          loading={loading}
          disabled={loading}
          containerStyle={styles.saveButton}
        />
      </View>
    </SafeAreaView>
  );
};

export default AddAddressScreen;
