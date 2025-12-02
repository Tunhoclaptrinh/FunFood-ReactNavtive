import {useState, useCallback} from "react";
import {View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, RefreshControl} from "react-native";
import SafeAreaView from "@/src/components/common/SafeAreaView";
import {Ionicons} from "@expo/vector-icons";
import {useFocusEffect} from "@react-navigation/native";
import EmptyState from "@/src/components/common/EmptyState/EmptyState";
import {COLORS} from "@/src/styles/colors";
import {Address, AddressService} from "@/src/services/address.service";
import styles from "./styles";

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
      const response = await AddressService.getAddresses();
      setAddresses(response.data || []);
    } catch (error: any) {
      console.error("Lỗi khi tải địa chỉ:", error);
      Alert.alert("Lỗi", error.message || "Không thể tải danh sách địa chỉ");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadAddresses();
  };

  const handleSetDefault = async (id: number, label: string) => {
    try {
      await AddressService.setAsDefault(id);
      // Cập nhật state local
      setAddresses(
        addresses.map((addr) => ({
          ...addr,
          isDefault: addr.id === id,
        }))
      );
      Alert.alert("Thành công", `Đã đặt "${label}" làm địa chỉ mặc định`);
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Không thể đặt địa chỉ mặc định");
    }
  };

  const handleDelete = (id: number, label: string) => {
    Alert.alert("Xóa địa chỉ", `Bạn có chắc muốn xóa địa chỉ "${label}"?`, [
      {text: "Hủy", style: "cancel"},
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await AddressService.deleteAddress(id);
            setAddresses(addresses.filter((addr) => addr.id !== id));
            Alert.alert("Thành công", "Đã xóa địa chỉ");
          } catch (error: any) {
            Alert.alert("Lỗi", error.message || "Không thể xóa địa chỉ");
          }
        },
      },
    ]);
  };

  const handleEdit = (address: Address) => {
    navigation.navigate("AddAddress", {address});
  };

  const getIconForLabel = (label: string) => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes("nhà") || lowerLabel.includes("home")) return "home";
    if (lowerLabel.includes("công ty") || lowerLabel.includes("office") || lowerLabel.includes("business"))
      return "business";
    return "location";
  };

  const renderAddressCard = ({item}: {item: Address}) => (
    <View style={styles.addressCard}>
      {/* Default Badge */}
      {item.isDefault && (
        <View style={styles.defaultBadge}>
          <Ionicons name="checkmark-circle" size={14} color={COLORS.SUCCESS} />
          <Text style={styles.defaultText}>Mặc định</Text>
        </View>
      )}

      {/* Label */}
      <View style={styles.labelContainer}>
        <View style={styles.labelIconContainer}>
          <Ionicons name={getIconForLabel(item.label) as any} size={20} color={COLORS.PRIMARY} />
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

      {/* GPS Coordinates */}
      {item.latitude && item.longitude && (
        <View style={styles.gpsSection}>
          <Ionicons name="navigate-outline" size={14} color={COLORS.INFO} />
          <Text style={styles.gpsText}>
            GPS: {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}
          </Text>
        </View>
      )}

      {/* Note */}
      {item.note && (
        <View style={styles.noteSection}>
          <Ionicons name="information-circle-outline" size={14} color={COLORS.INFO} />
          <Text style={styles.noteText}>{item.note}</Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsContainer}>
        {/* {!item.isDefault && ( */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleSetDefault(item.id, item.label)}
          activeOpacity={0.7}
          disabled={item.isDefault}
        >
          <Ionicons name="star-outline" size={18} color={item.isDefault ? COLORS.DARK_GRAY : COLORS.PRIMARY} />
          <Text style={item.isDefault ? styles.actionTextDisabled : styles.actionText}>
            {item.isDefault ? "Đã mặc định" : "Đặt mặc định"}
          </Text>
        </TouchableOpacity>
        {/* )} */}

        <TouchableOpacity style={styles.actionButton} onPress={() => handleEdit(item)} activeOpacity={0.7}>
          <Ionicons name="create-outline" size={18} color={COLORS.INFO} />
          <Text style={[styles.actionText, {color: COLORS.INFO}]}>Sửa</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDelete(item.id, item.label)}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={18} color={COLORS.ERROR} />
          <Text style={[styles.actionText, {color: COLORS.ERROR}]}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Đang tải danh sách địa chỉ...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>
          {addresses.length > 0 ? `Bạn có ${addresses.length} địa chỉ đã lưu` : "Thêm địa chỉ giao hàng của bạn"}
        </Text>
      </View>

      {addresses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyState
            icon="location-outline"
            title="Chưa có địa chỉ"
            subtitle="Thêm địa chỉ giao hàng để đặt món nhanh hơn"
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

export default AddressListScreen;
