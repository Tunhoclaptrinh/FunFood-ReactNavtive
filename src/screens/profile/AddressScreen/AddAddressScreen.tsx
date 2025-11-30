import React, {useState, useEffect} from "react";
import {View, ScrollView, StyleSheet, Text, TouchableOpacity, Alert, Switch, TextInput} from "react-native";
import SafeAreaView from "@/src/components/common/SafeAreaView";
import {Ionicons} from "@expo/vector-icons";
import {useGeolocation} from "@hooks/useGeolocation";
import Input from "@/src/components/common/Input/Input";
import Button from "@/src/components/common/Button";
import {COLORS} from "@/src/styles/colors";
import {AddressService, CreateAddressRequest} from "@/src/services/address.service";

const PRESET_LABELS = [
  {label: "Nhà riêng", icon: "home"},
  {label: "Công ty", icon: "business"},
  {label: "Khác", icon: "location"},
];

const AddAddressScreen = ({route, navigation}: any) => {
  const existingAddress = route.params?.address;
  const isEdit = !!existingAddress;

  const {location, requestLocation} = useGeolocation();
  const [loading, setLoading] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(
    existingAddress?.label && PRESET_LABELS.some((p) => p.label === existingAddress.label)
      ? existingAddress.label
      : null
  );
  const [customLabel, setCustomLabel] = useState(
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
    setSelectedPreset(label);
    setCustomLabel("");
  };

  const getCurrentLabel = (): string => {
    if (selectedPreset) return selectedPreset;
    if (customLabel.trim()) return customLabel.trim();
    return "";
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

    // Thêm validation cho custom label nếu không chọn preset
    if (!selectedPreset && !customLabel.trim()) {
      validation.errors.label = "Vui lòng chọn hoặc nhập nhãn địa chỉ";
      validation.isValid = false;
    }

    setErrors(validation.errors);
    return validation.isValid;
  };

  const handleGetCurrentLocation = async () => {
    try {
      await requestLocation();
      if (location) {
        setFormData({
          ...formData,
          latitude: location.latitude,
          longitude: location.longitude,
        });
        Alert.alert("Thành công", "Đã lấy vị trí hiện tại");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể lấy vị trí hiện tại");
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

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
        Alert.alert("Thành công", "Đã cập nhật địa chỉ", [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        await AddressService.createAddress(data);
        Alert.alert("Thành công", "Đã thêm địa chỉ mới", [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]);
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
          <Text style={styles.headerTitle}>{isEdit ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}</Text>
          <Text style={styles.headerSubtitle}>
            {isEdit ? "Cập nhật thông tin địa chỉ giao hàng" : "Nhập thông tin địa chỉ giao hàng mới"}
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          {/* Label Selection */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nhãn địa chỉ *</Text>
            <View style={styles.labelOptions}>
              {PRESET_LABELS.map((option) => (
                <TouchableOpacity
                  key={option.label}
                  style={[styles.labelOption, selectedPreset === option.label && styles.labelOptionActive]}
                  onPress={() => handlePresetSelect(option.label)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={20}
                    color={selectedPreset === option.label ? COLORS.WHITE : COLORS.PRIMARY}
                  />
                  <Text
                    style={[styles.labelOptionText, selectedPreset === option.label && styles.labelOptionTextActive]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom Label Input */}
            <View style={styles.customLabelContainer}>
              <Text style={styles.customLabelTitle}>Hoặc nhập nhãn tùy chỉnh:</Text>
              <Input
                value={customLabel}
                onChangeText={(text) => {
                  setCustomLabel(text);
                  setSelectedPreset(null);
                }}
                placeholder="VD: Nhà bạn gái, Nhà bố mẹ..."
                maxLength={50}
                error={!selectedPreset && !customLabel.trim() ? errors.label : undefined}
                containerStyle={styles.customLabelInput}
              />
            </View>
          </View>

          {/* Recipient Name */}
          <View style={styles.inputContainer}>
            <View style={styles.labelRow}>
              <Ionicons name="person-outline" size={20} color={COLORS.GRAY} />
              <Text style={styles.label}>Tên người nhận *</Text>
            </View>
            <Input
              value={formData.recipientName}
              onChangeText={(recipientName) => setFormData({...formData, recipientName})}
              placeholder="Nhập tên người nhận"
              error={errors.recipientName}
              containerStyle={styles.input}
            />
          </View>

          {/* Phone Number */}
          <View style={styles.inputContainer}>
            <View style={styles.labelRow}>
              <Ionicons name="call-outline" size={20} color={COLORS.GRAY} />
              <Text style={styles.label}>Số điện thoại *</Text>
            </View>
            <Input
              value={formData.recipientPhone}
              onChangeText={(recipientPhone) => setFormData({...formData, recipientPhone})}
              placeholder="0912345678"
              keyboardType="phone-pad"
              error={errors.recipientPhone}
              containerStyle={styles.input}
            />
          </View>

          {/* Address */}
          <View style={styles.inputContainer}>
            <View style={styles.labelRow}>
              <Ionicons name="location-outline" size={20} color={COLORS.GRAY} />
              <Text style={styles.label}>Địa chỉ đầy đủ *</Text>
            </View>
            <Input
              value={formData.address}
              onChangeText={(address) => setFormData({...formData, address})}
              placeholder="Nhập số nhà, tên đường, phường/xã, quận/huyện..."
              multiline
              numberOfLines={4}
              error={errors.address}
              containerStyle={styles.input}
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
                title="Lấy vị trí"
                onPress={handleGetCurrentLocation}
                variant="outline"
                size="small"
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
              containerStyle={styles.input}
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
            <Text style={styles.noteText}>Các trường có dấu * là bắt buộc</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.DARK,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.GRAY,
    lineHeight: 20,
  },
  formSection: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 24,
  },
  labelRow: {
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
  labelOptions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  labelOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
    backgroundColor: COLORS.WHITE,
  },
  labelOptionActive: {
    backgroundColor: COLORS.PRIMARY,
  },
  labelOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.PRIMARY,
  },
  labelOptionTextActive: {
    color: COLORS.WHITE,
  },
  customLabelContainer: {
    marginTop: 8,
  },
  customLabelTitle: {
    fontSize: 13,
    color: COLORS.GRAY,
    marginBottom: 8,
  },
  customLabelInput: {
    marginVertical: 0,
  },
  gpsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 12,
    padding: 12,
  },
  gpsInfo: {
    flex: 1,
  },
  gpsText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.DARK,
    marginBottom: 4,
  },
  gpsSubtext: {
    fontSize: 11,
    color: COLORS.SUCCESS,
  },
  gpsPlaceholder: {
    fontSize: 13,
    color: COLORS.GRAY,
  },
  gpsButton: {
    paddingHorizontal: 16,
  },
  defaultContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF8E1",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  defaultInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  defaultText: {
    flex: 1,
  },
  defaultTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.DARK,
    marginBottom: 4,
  },
  defaultSubtitle: {
    fontSize: 12,
    color: COLORS.GRAY,
  },
  noteContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
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
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});

export default AddAddressScreen;
