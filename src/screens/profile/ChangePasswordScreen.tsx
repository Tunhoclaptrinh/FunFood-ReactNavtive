import React, {useState} from "react";
import {View, ScrollView, StyleSheet, Text, TouchableOpacity, Alert} from "react-native";
import SafeAreaView from "@/src/components/common/SafeAreaView";
import {Ionicons} from "@expo/vector-icons";
import {apiClient} from "@config/api.client";
import Input from "@/src/components/common/Input/Input";
import Button from "@/src/components/common/Button";
import {COLORS} from "@/src/styles/colors";

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
      errors.push("At least 6 characters");
    }
    if (!/[A-Z]/.test(password) && !/[0-9]/.test(password)) {
      errors.push("At least one uppercase letter or number");
    }

    return errors;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else {
      const passwordErrors = validatePassword(formData.newPassword);
      if (passwordErrors.length > 0) {
        newErrors.newPassword = passwordErrors.join(", ");
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (formData.currentPassword && formData.newPassword && formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = "New password must be different from current password";
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
      {strength: 1, label: "Weak", color: COLORS.ERROR},
      {strength: 2, label: "Weak", color: COLORS.ERROR},
      {strength: 3, label: "Medium", color: COLORS.WARNING},
      {strength: 4, label: "Strong", color: COLORS.SUCCESS},
      {strength: 5, label: "Very Strong", color: COLORS.SUCCESS},
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

      Alert.alert("Success", "Your password has been changed successfully", [
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
      Alert.alert("Error", error.response?.data?.message || "Failed to change password");
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
          <Text style={styles.headerTitle}>Change Password</Text>
          <Text style={styles.headerSubtitle}>Please enter your current password and choose a new secure password</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          {/* Current Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Current Password</Text>
            <View style={styles.passwordInputContainer}>
              <Input
                value={formData.currentPassword}
                onChangeText={(currentPassword) => setFormData({...formData, currentPassword})}
                placeholder="Enter current password"
                secureTextEntry={!showPasswords.current}
                error={errors.currentPassword}
                containerStyle={styles.input}
              />
            </View>
          </View>

          {/* New Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>New Password</Text>
            <View style={styles.passwordInputContainer}>
              <Input
                value={formData.newPassword}
                onChangeText={(newPassword) => setFormData({...formData, newPassword})}
                placeholder="Enter new password"
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
            <Text style={styles.label}>Confirm New Password</Text>
            <View style={styles.passwordInputContainer}>
              <Input
                value={formData.confirmPassword}
                onChangeText={(confirmPassword) => setFormData({...formData, confirmPassword})}
                placeholder="Re-enter new password"
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
                  {formData.newPassword === formData.confirmPassword ? "Passwords match" : "Passwords do not match"}
                </Text>
              </View>
            )}
          </View>

          {/* Password Requirements */}
          <View style={styles.requirementsContainer}>
            <Text style={styles.requirementsTitle}>Password Requirements:</Text>
            <View style={styles.requirement}>
              <Ionicons
                name={formData.newPassword.length >= 6 ? "checkmark-circle" : "ellipse-outline"}
                size={16}
                color={formData.newPassword.length >= 6 ? COLORS.SUCCESS : COLORS.GRAY}
              />
              <Text style={styles.requirementText}>At least 6 characters</Text>
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
              <Text style={styles.requirementText}>At least one uppercase letter or number</Text>
            </View>
          </View>
        </View>

        {/* Change Password Button */}
        <View style={styles.buttonContainer}>
          <View style={styles.button}>
            <Button
              title={loading ? "Changing Password..." : "Change Password"}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  header: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 16,
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.WHITE,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    textAlign: "center",
    lineHeight: 20,
  },
  formSection: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.DARK,
    marginBottom: 8,
  },
  passwordInputContainer: {
    position: "relative",
  },
  input: {
    marginVertical: 0,
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
    top: 12,
    padding: 4,
  },
  strengthContainer: {
    marginTop: 12,
  },
  strengthBars: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 8,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  matchIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  matchText: {
    fontSize: 12,
    fontWeight: "500",
  },
  requirementsContainer: {
    backgroundColor: "#F0F9FF",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  requirementsTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.INFO,
    marginBottom: 12,
  },
  requirement: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 13,
    color: COLORS.DARK,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  button: {
    width: "100%",
  },
});

export default ChangePasswordScreen;
