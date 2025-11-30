import React, {useState} from "react";
import {View, ScrollView, StyleSheet, Text, TouchableOpacity, Alert} from "react-native";
import SafeAreaView from "@/src/components/common/SafeAreaView";
import {Ionicons} from "@expo/vector-icons";
import {apiClient} from "@config/api.client";
import Input from "@/src/components/common/Input/Input";
import Button from "@/src/components/common/Button";
import {COLORS} from "@/src/styles/colors";
import styles from "./styles";

const ChangePasswordScreen = ({navigation}: any) => {
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validatePassword = (password: string) => {
    const errors: string[] = [];

    if (password.length < 6) {
      errors.push("Ít nhất 6 ký tự");
    }
    if (!/[A-Z]/.test(password) && !/[0-9]/.test(password)) {
      errors.push("Có ít nhất một chữ in hoa hoặc một số");
    }

    return errors;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
    } else {
      const passwordErrors = validatePassword(formData.newPassword);
      if (passwordErrors.length > 0) {
        newErrors.newPassword = passwordErrors.join(", ");
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu không trùng khớp";
    }

    if (formData.currentPassword && formData.newPassword && formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = "Mật khẩu mới phải khác mật khẩu hiện tại";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return {strength: 0, label: "", color: ""};

    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const levels = [
      {strength: 0, label: "", color: ""},
      {strength: 1, label: "Yếu", color: COLORS.ERROR},
      {strength: 2, label: "Yếu", color: COLORS.ERROR},
      {strength: 3, label: "Trung bình", color: COLORS.WARNING},
      {strength: 4, label: "Mạnh", color: COLORS.SUCCESS},
      {strength: 5, label: "Rất mạnh", color: COLORS.SUCCESS},
    ];

    return levels[strength];
  };

  const handleChangePassword = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await apiClient.put("/auth/change-password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      Alert.alert("Thành công", "Mật khẩu của bạn đã được đổi thành công", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);

      // Reset form
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      console.error("Error changing password:", error);
      Alert.alert("Lỗi", error.response?.data?.message || "Đổi mật khẩu thất bại");
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Header Info */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="lock-closed" size={32} color={COLORS.PRIMARY} />
          </View>
          <Text style={styles.headerTitle}>Đổi mật khẩu</Text>
          <Text style={styles.headerSubtitle}>Vui lòng nhập mật khẩu hiện tại và chọn một mật khẩu mới an toàn</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          {/* Current Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Mật khẩu hiện tại</Text>
            <View style={styles.passwordInputContainer}>
              <Input
                value={formData.currentPassword}
                onChangeText={(currentPassword) => setFormData({...formData, currentPassword})}
                placeholder="Nhập mật khẩu hiện tại"
                secureTextEntry={!showPasswords.current}
                error={errors.currentPassword}
                containerStyle={styles.input}
              />
            </View>
          </View>

          {/* New Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Mật khẩu mới</Text>
            <View style={styles.passwordInputContainer}>
              <Input
                value={formData.newPassword}
                onChangeText={(newPassword) => setFormData({...formData, newPassword})}
                placeholder="Nhập mật khẩu mới"
                secureTextEntry={!showPasswords.new}
                error={errors.newPassword}
                containerStyle={styles.input}
              />
            </View>

            {/* Password Strength Indicator */}
            {formData.newPassword.length > 0 && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBars}>
                  {[1, 2, 3, 4, 5].map((bar) => (
                    <View
                      key={bar}
                      style={[
                        styles.strengthBar,
                        bar <= passwordStrength.strength && {
                          backgroundColor: passwordStrength.color,
                        },
                      ]}
                    />
                  ))}
                </View>
                {passwordStrength.label && (
                  <Text style={[styles.strengthLabel, {color: passwordStrength.color}]}>{passwordStrength.label}</Text>
                )}
              </View>
            )}
          </View>

          {/* Confirm Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
            <View style={styles.passwordInputContainer}>
              <Input
                value={formData.confirmPassword}
                onChangeText={(confirmPassword) => setFormData({...formData, confirmPassword})}
                placeholder="Nhập lại mật khẩu mới"
                secureTextEntry={!showPasswords.confirm}
                error={errors.confirmPassword}
                containerStyle={styles.input}
              />
            </View>

            {/* Match Indicator */}
            {formData.confirmPassword && (
              <View style={styles.matchIndicator}>
                <Ionicons
                  name={formData.newPassword === formData.confirmPassword ? "checkmark-circle" : "close-circle"}
                  size={16}
                  color={formData.newPassword === formData.confirmPassword ? COLORS.SUCCESS : COLORS.ERROR}
                />
                <Text
                  style={[
                    styles.matchText,
                    {
                      color: formData.newPassword === formData.confirmPassword ? COLORS.SUCCESS : COLORS.ERROR,
                    },
                  ]}
                >
                  {formData.newPassword === formData.confirmPassword
                    ? "Mật khẩu trùng khớp"
                    : "Mật khẩu không trùng khớp"}
                </Text>
              </View>
            )}
          </View>

          {/* Password Requirements */}
          <View style={styles.requirementsContainer}>
            <Text style={styles.requirementsTitle}>Yêu cầu mật khẩu:</Text>

            <View style={styles.requirement}>
              <Ionicons
                name={formData.newPassword.length >= 6 ? "checkmark-circle" : "ellipse-outline"}
                size={16}
                color={formData.newPassword.length >= 6 ? COLORS.SUCCESS : COLORS.GRAY}
              />
              <Text style={styles.requirementText}>Ít nhất 6 ký tự</Text>
            </View>

            <View style={styles.requirement}>
              <Ionicons
                name={
                  /[A-Z]/.test(formData.newPassword) || /[0-9]/.test(formData.newPassword)
                    ? "checkmark-circle"
                    : "ellipse-outline"
                }
                size={16}
                color={
                  /[A-Z]/.test(formData.newPassword) || /[0-9]/.test(formData.newPassword)
                    ? COLORS.SUCCESS
                    : COLORS.GRAY
                }
              />
              <Text style={styles.requirementText}>Có ít nhất một chữ in hoa hoặc một số</Text>
            </View>
          </View>
        </View>

        {/* Change Password Button */}
        <View style={styles.buttonContainer}>
          <View style={styles.button}>
            <Button
              title={loading ? "Đang đổi mật khẩu..." : "Đổi mật khẩu"}
              onPress={handleChangePassword}
              loading={loading}
              disabled={loading || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ChangePasswordScreen;
