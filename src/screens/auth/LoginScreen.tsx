import React, {useState} from "react";
import {View, StyleSheet, ScrollView, TouchableOpacity, Text, Image} from "react-native";
import {useAuth} from "@hooks/useAuth";
import Input from "@/src/components/common/Input/Input";
import Button from "@/src/components/common/Button";
// @ts-ignore
import logo from "@/assets/funfood-logo/logo5.png";

import {validateEmail, validatePassword} from "@utils/validation";
import {COLORS} from "@/src/styles/colors";
import {useTranslation} from "@/src/utils/i18n";
import {useTheme} from "@react-navigation/native";

const LoginScreen = ({navigation}: any) => {
  const [email, setEmail] = useState("user@funfood.com");
  const [password, setPassword] = useState("123456");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const {login} = useAuth();
  const [loading, setLoading] = useState(false);

  const {t} = useTranslation(); // Giả sử bạn đã thêm các key 'login_title', 'email_placeholder' vào file i18n.ts
  const {colors} = useTheme();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!validateEmail(email)) newErrors.email = "Invalid email";
    if (!validatePassword(password)) newErrors.password = "Password too short";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      await login({email, password});
    } catch (error: any) {
      setErrors({general: error.response?.data?.message || "Login failed"});
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Image source={logo} style={styles.logo} resizeMode="contain" />

      <Text style={styles.subtitle}>Welcome Back!</Text>

      {errors.general && <Text style={styles.errorText}>{errors.general}</Text>}

      <Input
        label="Email"
        placeholder="your@email.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        error={errors.email}
        containerStyle={styles.input}
      />

      <Input
        label="Password"
        placeholder="••••••••"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        error={errors.password}
        containerStyle={styles.input}
      />

      <Button title={t("login") || "Login"} onPress={handleLogin} loading={loading} containerStyle={styles.button} />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={styles.linkText}>Register</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.WHITE},
  content: {padding: 20, justifyContent: "center", flexGrow: 1},
  title: {fontSize: 32, fontWeight: "bold", color: COLORS.PRIMARY, textAlign: "center", marginBottom: 8},
  subtitle: {fontSize: 16, color: COLORS.GRAY, textAlign: "center", marginBottom: 24},
  input: {marginVertical: 12},
  button: {marginTop: 20, width: "100%"},
  errorText: {color: COLORS.ERROR, marginBottom: 12, textAlign: "center"},
  footer: {flexDirection: "row", justifyContent: "center", marginTop: 20},
  footerText: {color: COLORS.GRAY},
  linkText: {color: COLORS.PRIMARY, fontWeight: "600"},
  logo: {
    alignSelf: "center",
    marginBottom: 20,
    resizeMode: "contain",
    width: 120,
    height: 36,
  },
});

export default LoginScreen;
