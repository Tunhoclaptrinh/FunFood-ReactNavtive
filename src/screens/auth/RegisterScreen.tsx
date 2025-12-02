import React, {useState} from "react";
import {View, StyleSheet, ScrollView, TouchableOpacity, Text, Image} from "react-native";
import {useAuth} from "@hooks/useAuth";
import Input from "@/src/components/common/Input/Input";
import Button from "@/src/components/common/Button";
import {COLORS} from "@/src/styles/colors";
// @ts-ignore
import logo from "@/assets/funfood-logo/logo5.png";

const RegisterScreen = ({navigation}: any) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const {register} = useAuth();
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    try {
      await register(formData as any);
    } catch (error: any) {
      setErrors({general: error.response?.data?.message || "Registration failed"});
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Image source={logo} style={styles.logo} resizeMode="contain" />

      <Text style={styles.title}>Create Account</Text>

      <Input
        label="Full Name"
        value={formData.name}
        onChangeText={(name) => setFormData({...formData, name})}
        error={errors.name}
      />

      <Input
        label="Email"
        value={formData.email}
        onChangeText={(email) => setFormData({...formData, email})}
        keyboardType="email-address"
        error={errors.email}
      />

      <Input
        label="Phone"
        value={formData.phone}
        onChangeText={(phone) => setFormData({...formData, phone})}
        keyboardType="phone-pad"
        error={errors.phone}
      />

      <Input
        label="Password"
        value={formData.password}
        onChangeText={(password) => setFormData({...formData, password})}
        secureTextEntry
        error={errors.password}
      />

      <Input
        label="Confirm Password"
        value={formData.confirmPassword}
        onChangeText={(confirmPassword) => setFormData({...formData, confirmPassword})}
        secureTextEntry
        error={errors.confirmPassword}
      />

      <Button title="Register" onPress={handleRegister} loading={loading} containerStyle={styles.button} />

      <View style={styles.footer}>
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.linkText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.WHITE},
  content: {padding: 20, justifyContent: "center", flexGrow: 1},
  title: {fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center", color: COLORS.PRIMARY},
  button: {marginTop: 20, width: "100%"},
  footer: {marginTop: 20, alignItems: "center"},
  linkText: {color: COLORS.PRIMARY, fontWeight: "600", textAlign: "center"},
  logo: {
    alignSelf: "center",
    marginBottom: 20,
    resizeMode: "contain",
    width: 120,
    height: 36,
  },
});

export default RegisterScreen;
