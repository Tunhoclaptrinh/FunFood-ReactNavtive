import React from "react";
import {View, StyleSheet, Text} from "react-native";
import Button from "@components/common/Button";
import {useAuth} from "@hooks/useAuth";
import {COLORS} from "@/src/config/constants";

const ProfileScreen = () => {
  const {user, signOut} = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.name}>{user?.name}</Text>
      <Text style={styles.email}>{user?.email}</Text>
      <Button title="Logout" onPress={signOut} style={styles.button} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.WHITE, padding: 20, justifyContent: "center"},
  title: {fontSize: 24, fontWeight: "bold", marginBottom: 16, color: COLORS.DARK},
  name: {fontSize: 18, fontWeight: "600", marginBottom: 8},
  email: {fontSize: 14, color: COLORS.GRAY, marginBottom: 20},
  button: {marginTop: 20},
});

export default ProfileScreen;
