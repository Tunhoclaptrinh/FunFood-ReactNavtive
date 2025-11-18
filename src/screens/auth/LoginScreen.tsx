import React, {useState} from "react";
import {View, StyleSheet, TouchableOpacity, Text, Alert, KeyboardAvoidingView, Platform} from "react-native";
import {useAuthStore} from "@store/authStore";
import {authApi} from "@api/auth.api";
import {colors} from "@constants/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {MaterialCommunityIcons as Icon} from "@expo/vector-icons";
import {Button} from "@components/base/Button"; // Dùng button base
import {Input} from "@components/base/Input"; // Dùng input mới tạo

const LoginScreen: React.FC<any> = ({navigation}) => {
  const [email, setEmail] = useState("user@funfood.com");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const {setAuth} = useAuthStore();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.login({email, password});
      const {user, token} = response.data.data;

      await AsyncStorage.setItem("authToken", token);
      await AsyncStorage.setItem("user", JSON.stringify(user));

      setAuth(user, token);
      // Alert.alert("Success", "Login successful!"); // Tạm tắt để trải nghiệm mượt hơn
    } catch (error: any) {
      Alert.alert("Login Failed", error.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>🍔 FunFood</Text>
          <Text style={styles.subtitle}>Welcome Back</Text>
        </View>

        <View style={styles.form}>
          <Input
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View>
            <Input placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
            <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
              <Icon name={showPassword ? "eye" : "eye-off"} size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <Button title="Login" onPress={handleLogin} loading={loading} disabled={loading} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={styles.registerLink}>Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: "#fff"},
  content: {flex: 1, padding: 20, justifyContent: "center"},
  header: {marginBottom: 40, alignItems: "center"},
  title: {fontSize: 32, fontWeight: "bold", marginBottom: 8, color: colors.primary},
  subtitle: {fontSize: 16, color: "#666"},
  form: {marginBottom: 30},
  eyeIcon: {position: "absolute", right: 12, top: 14}, // Căn chỉnh lại vị trí icon mắt
  footer: {flexDirection: "row", justifyContent: "center", alignItems: "center"},
  footerText: {color: "#666"},
  registerLink: {color: colors.primary, fontWeight: "600"},
});

export default LoginScreen;
