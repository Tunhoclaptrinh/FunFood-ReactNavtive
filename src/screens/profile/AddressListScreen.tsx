import React, {useState, useEffect, useCallback} from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {useFocusEffect} from "@react-navigation/native";
import {apiClient} from "@config/api.client";
import EmptyState from "@/src/components/common/EmptyState/EmptyState";
import {COLORS} from "@/src/styles/colors";

interface Address {
  id: number;
  label: string;
  address: string;
  recipientName: string;
  recipientPhone: string;
  latitude?: number;
  longitude?: number;
  note?: string;
  isDefault: boolean;
}

const AddressListScreen = ({navigation}: any) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadAddresses();
    }, [])
  );

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/addresses");
      setAddresses(response.data.data || []);
    } catch (error) {
      console.error("Error loading addresses:", error);
      Alert.alert("Error", "Failed to load addresses");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadAddresses();
  };

  const handleSetDefault = async (id: number) => {
    try {
      await apiClient.patch(`/addresses/${id}/default`);
      // Update local state
      setAddresses(
        addresses.map((addr) => ({
          ...addr,
          isDefault: addr.id === id,
        }))
      );
      Alert.alert("Success", "Default address updated");
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Failed to set default address");
    }
  };

  const handleDelete = (id: number, label: string) => {
    Alert.alert("Delete Address", `Are you sure you want to delete "${label}"?`, [
      {text: "Cancel", style: "cancel"},
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await apiClient.delete(`/addresses/${id}`);
            setAddresses(addresses.filter((addr) => addr.id !== id));
            Alert.alert("Success", "Address deleted");
          } catch (error: any) {
            Alert.alert("Error", error.response?.data?.message || "Failed to delete address");
          }
        },
      },
    ]);
  };

  const handleEdit = (address: Address) => {
    navigation.navigate("AddAddress", {address});
  };

  const renderAddressCard = ({item}: {item: Address}) => (
    <View style={styles.addressCard}>
      {/* Default Badge */}
      {item.isDefault && (
        <View style={styles.defaultBadge}>
          <Ionicons name="checkmark-circle" size={14} color={COLORS.SUCCESS} />
          <Text style={styles.defaultText}>Default</Text>
        </View>
      )}

      {/* Label */}
      <View style={styles.labelContainer}>
        <View style={styles.labelIconContainer}>
          <Ionicons
            name={
              item.label.toLowerCase() === "home"
                ? "home"
                : item.label.toLowerCase() === "office"
                ? "business"
                : "location"
            }
            size={20}
            color={COLORS.PRIMARY}
          />
        </View>
        <Text style={styles.label}>{item.label}</Text>
      </View>

      {/* Recipient Info */}
      <View style={styles.recipientSection}>
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={16} color={COLORS.GRAY} />
          <Text style={styles.recipientName}>{item.recipientName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={16} color={COLORS.GRAY} />
          <Text style={styles.recipientPhone}>{item.recipientPhone}</Text>
        </View>
      </View>

      {/* Address */}
      <View style={styles.addressSection}>
        <Ionicons name="location-outline" size={16} color={COLORS.GRAY} />
        <Text style={styles.addressText}>{item.address}</Text>
      </View>

      {/* Note */}
      {item.note && (
        <View style={styles.noteSection}>
          <Ionicons name="information-circle-outline" size={14} color={COLORS.INFO} />
          <Text style={styles.noteText}>{item.note}</Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsContainer}>
        {!item.isDefault && (
          <TouchableOpacity style={styles.actionButton} onPress={() => handleSetDefault(item.id)} activeOpacity={0.7}>
            <Ionicons name="star-outline" size={18} color={COLORS.PRIMARY} />
            <Text style={styles.actionText}>Set as Default</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.actionButton} onPress={() => handleEdit(item)} activeOpacity={0.7}>
          <Ionicons name="create-outline" size={18} color={COLORS.INFO} />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDelete(item.id, item.label)}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={18} color={COLORS.ERROR} />
          <Text style={[styles.actionText, {color: COLORS.ERROR}]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Loading addresses...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {addresses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyState
            icon="location-outline"
            title="No Addresses"
            subtitle="Add your delivery addresses for faster checkout"
            containerStyle={styles.emptyState}
          />
        </View>
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderAddressCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.PRIMARY]}
              tintColor={COLORS.PRIMARY}
            />
          }
        />
      )}

      {/* Add New Address FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate("AddAddress", {})} activeOpacity={0.8}>
        <Ionicons name="add" size={28} color={COLORS.WHITE} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.GRAY,
  },
  emptyContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  addressCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  defaultBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F8F1",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  defaultText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.SUCCESS,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  labelIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFE5E5",
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.DARK,
  },
  recipientSection: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  recipientName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.DARK,
  },
  recipientPhone: {
    fontSize: 14,
    color: COLORS.GRAY,
  },
  addressSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.DARK,
    lineHeight: 20,
  },
  noteSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F0F9FF",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.INFO,
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
  },
  actionText: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.PRIMARY,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default AddressListScreen;
