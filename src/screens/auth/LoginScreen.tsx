import React, {useState} from "react";
import {View, StyleSheet, TouchableOpacity, Text, Alert, KeyboardAvoidingView, Platform} from "react-native";
import {Input, Button, Spin} from "@ant-design/react-native";
import {useAuthStore} from "@store/authStore";
import {authApi} from "@api/auth.api";
import {colors} from "@constants/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

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
      Alert.alert("Success", "Login successful!");
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
            disabled={loading}
            style={styles.input}
            placeholderTextColor="#999"
          />

          <View style={styles.passwordContainer}>
            <Input
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              disabled={loading}
              style={styles.input}
              placeholderTextColor="#999"
            />
            <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
              <Icon name={showPassword ? "eye" : "eye-off"} size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <Button activeStyle={{opacity: 0.8}} onPress={handleLogin} disabled={loading} style={styles.button}>
            {loading ? <Spin size="small" /> : <Text style={styles.buttonText}>Login</Text>}
          </Button>
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
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  header: {
    marginBottom: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  form: {
    marginBottom: 30,
  },
  input: {
    marginBottom: 16,
    height: 48,
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  passwordContainer: {
    position: "relative",
    marginBottom: 16,
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
    top: 14,
  },
  button: {
    height: 48,
    marginTop: 10,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    color: "#666",
  },
  registerLink: {
    color: colors.primary,
    fontWeight: "600",
  },
});

export default LoginScreen;
