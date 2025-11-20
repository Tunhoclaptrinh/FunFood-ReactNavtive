import React, {useState} from "react";
import {View, StyleSheet, TouchableOpacity, Text, Alert, ScrollView} from "react-native";
import {authApi} from "@api/auth.api";
import {colors} from "@constants/colors";
import {ArrowLeft} from "lucide-react-native";
import {Button} from "@components/base/Button";
import {Input} from "@components/base/Input";

const RegisterScreen: React.FC<any> = ({navigation}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await authApi.register({name, email, phone, password});
      Alert.alert("Success", "Account created! Please login");
      navigation.navigate("Login");
    } catch (error: any) {
      Alert.alert("Registration Failed", error.response?.data?.message || "Try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Create Account</Text>
      </View>

      <View style={styles.form}>
        <Input placeholder="Full Name" value={name} onChangeText={setName} />
        <Input
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Input placeholder="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <Input placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <Input
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <Button title="Register" onPress={handleRegister} loading={loading} disabled={loading} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.loginLink}>Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: "#fff"},
  content: {padding: 20},
  header: {flexDirection: "row", alignItems: "center", marginBottom: 30, marginTop: 20},
  title: {fontSize: 24, fontWeight: "bold", marginLeft: 16},
  form: {marginBottom: 30},
  footer: {flexDirection: "row", justifyContent: "center"},
  footerText: {color: "#666"},
  loginLink: {color: colors.primary, fontWeight: "600"},
});

export default RegisterScreen;
