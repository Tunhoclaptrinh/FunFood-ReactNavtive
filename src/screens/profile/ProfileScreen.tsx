import React from "react";
import {View, Text, StyleSheet, TouchableOpacity, Alert} from "react-native";
import {useAuthStore} from "@store/authStore";
import {colors} from "@constants/colors";
import {User, Edit, MapPin, Heart, LogOut, ChevronRight} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ProfileScreen: React.FC = () => {
  const {user, logout} = useAuthStore();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {text: "Cancel", style: "cancel"},
      {
        text: "Logout",
        onPress: async () => {
          await AsyncStorage.removeItem("authToken");
          await AsyncStorage.removeItem("user");
          logout();
        },
        style: "destructive",
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <User size={60} color="#fff" />
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem}>
          <Edit size={24} color={colors.primary} />
          <Text style={styles.menuText}>Edit Profile</Text>
          <ChevronRight size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <MapPin size={24} color={colors.primary} />
          <Text style={styles.menuText}>Addresses</Text>
          <ChevronRight size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Heart size={24} color={colors.primary} />
          <Text style={styles.menuText}>Favorites</Text>
          <ChevronRight size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <LogOut size={24} color={colors.danger} />
          <Text style={[styles.menuText, {color: colors.danger}]}>Logout</Text>
          <ChevronRight size={24} color="#ccc" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: "#fff"},
  header: {backgroundColor: colors.primary, padding: 32, alignItems: "center"},
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  name: {fontSize: 24, fontWeight: "bold", color: "#fff"},
  email: {fontSize: 14, color: "rgba(255,255,255,0.8)", marginTop: 4},
  menu: {padding: 16},
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  menuText: {flex: 1, fontSize: 16, marginLeft: 16},
});

export default ProfileScreen;
