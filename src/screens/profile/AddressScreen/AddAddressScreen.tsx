import React, {useState, useEffect} from "react";
import {View, ScrollView, StyleSheet, Text, TouchableOpacity, Alert, Switch} from "react-native";
import SafeAreaView from "@/src/components/common/SafeAreaView";
import {Ionicons} from "@expo/vector-icons";
import {apiClient} from "@config/api.client";
import {useGeolocation} from "@hooks/useGeolocation";
import Input from "@/src/components/common/Input/Input";
import Button from "@/src/components/common/Button";
import {COLORS} from "@/src/styles/colors";

const LABEL_OPTIONS = [
  {label: "Home", icon: "home"},
  {label: "Office", icon: "business"},
  {label: "Other", icon: "location"},
];

const AddAddressScreen = ({route, navigation}: any) => {
  const existingAddress = route.params?.address;
  const isEdit = !!existingAddress;

  const {location, requestLocation} = useGeolocation();
  const [loading, setLoading] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState(existingAddress?.label || "Home");
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
      setFormData({
        ...formData,
        latitude: location.latitude,
        longitude: location.longitude,
      });
    }
  }, [location]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    } else if (formData.address.trim().length < 10) {
      newErrors.address = "Address is too short";
    }

    if (!formData.recipientName.trim()) {
      newErrors.recipientName = "Recipient name is required";
    }

    if (!formData.recipientPhone.trim()) {
      newErrors.recipientPhone = "Phone number is required";
    } else if (!/^(0|\+84)[0-9]{9}$/.test(formData.recipientPhone)) {
      newErrors.recipientPhone = "Invalid phone number format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
        Alert.alert("Success", "Current location captured");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to get current location");
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const data = {
        label: selectedLabel,
        address: formData.address.trim(),
        recipientName: formData.recipientName.trim(),
        recipientPhone: formData.recipientPhone.trim(),
        note: formData.note.trim() || undefined,
        latitude: formData.latitude,
        longitude: formData.longitude,
        isDefault: formData.isDefault,
      };

      if (isEdit) {
        await apiClient.put(`/addresses/${existingAddress.id}`, data);
        Alert.alert("Success", "Address updated successfully", [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        await apiClient.post("/addresses", data);
        Alert.alert("Success", "Address added successfully", [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]);
      }
    } catch (error: any) {
      console.error("Error saving address:", error);
      Alert.alert("Error", error.response?.data?.message || "Failed to save address");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{isEdit ? "Edit Address" : "Add New Address"}</Text>
          <Text style={styles.headerSubtitle}>
            {isEdit ? "Update your delivery address details" : "Enter details for your new delivery address"}
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          {/* Label Selection */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Address Label</Text>
            <View style={styles.labelOptions}>
              {LABEL_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.label}
                  style={[styles.labelOption, selectedLabel === option.label && styles.labelOptionActive]}
                  onPress={() => setSelectedLabel(option.label)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={20}
                    color={selectedLabel === option.label ? COLORS.WHITE : COLORS.PRIMARY}
                  />
                  <Text
                    style={[styles.labelOptionText, selectedLabel === option.label && styles.labelOptionTextActive]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Recipient Name */}
          <View style={styles.inputContainer}>
            <View style={styles.labelRow}>
              <Ionicons name="person-outline" size={20} color={COLORS.GRAY} />
              <Text style={styles.label}>Recipient Name *</Text>
            </View>
            <Input
              value={formData.recipientName}
              onChangeText={(recipientName) => setFormData({...formData, recipientName})}
              placeholder="Enter recipient name"
              error={errors.recipientName}
              containerStyle={styles.input}
            />
          </View>

          {/* Phone Number */}
          <View style={styles.inputContainer}>
            <View style={styles.labelRow}>
              <Ionicons name="call-outline" size={20} color={COLORS.GRAY} />
              <Text style={styles.label}>Phone Number *</Text>
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
              <Text style={styles.label}>Full Address *</Text>
            </View>
            <Input
              value={formData.address}
              onChangeText={(address) => setFormData({...formData, address})}
              placeholder="Enter street address, building, floor..."
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
              <Text style={styles.label}>GPS Location (Optional)</Text>
            </View>
            <View style={styles.gpsContainer}>
              <View style={styles.gpsInfo}>
                {formData.latitude && formData.longitude ? (
                  <>
                    <Text style={styles.gpsText}>
                      📍 {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                    </Text>
                    <Text style={styles.gpsSubtext}>Location captured</Text>
                  </>
                ) : (
                  <Text style={styles.gpsPlaceholder}>No GPS coordinates yet</Text>
                )}
              </View>
              <Button
                title="Get Location"
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
              <Text style={styles.label}>Delivery Notes (Optional)</Text>
            </View>
            <Input
              value={formData.note}
              onChangeText={(note) => setFormData({...formData, note})}
              placeholder="e.g., Ring the bell, Call when arrived..."
              multiline
              numberOfLines={2}
              containerStyle={styles.input}
            />
          </View>

          {/* Set as Default */}
          <View style={styles.defaultContainer}>
            <View style={styles.defaultInfo}>
              <Ionicons name="star" size={20} color={COLORS.WARNING} />
              <View style={styles.defaultText}>
                <Text style={styles.defaultTitle}>Set as Default</Text>
                <Text style={styles.defaultSubtitle}>Use this address as default for checkout</Text>
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
            <Text style={styles.noteText}>Fields marked with * are required</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.bottomButtons}>
        <Button
          title="Cancel"
          onPress={() => navigation.goBack()}
          variant="outline"
          containerStyle={styles.cancelButton}
        />

        <Button
          title={loading ? "Saving..." : isEdit ? "Update" : "Add Address"}
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
    elevation: 5,
    shadowColor: COLORS.BLACK,
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});

export default AddAddressScreen;
