import {Address} from "react-native-maps";
import {CartItem} from "../types";

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const calculateDeliveryFee = (distance: number): number => {
  const distanceKm = parseFloat(distance.toFixed(1)); // <--- QUAN TRỌNG

  const BASE_FEE = 15000;
  const PER_KM_FEE = 5000;
  const EXTRA_PER_KM_FEE = 7000;

  if (distanceKm <= 2) return BASE_FEE;
  if (distanceKm <= 5) return BASE_FEE + Math.ceil(distanceKm - 2) * PER_KM_FEE;
  return BASE_FEE + 3 * PER_KM_FEE + Math.ceil(distanceKm - 5) * EXTRA_PER_KM_FEE;
};

// Interface cho nhóm đơn hàng
interface RestaurantGroup {
  restaurantId: number;
  restaurantName: string;
  restaurantAddress: string;
  items: CartItem[];
  subtotal: number; // Tổng tiền món
  distance: number;
  deliveryFee: number;
}

// Hàm xử lý logic gom nhóm và tính phí
export const processCartGroups = (
  items: CartItem[],
  userAddress: Address | null,
  userLocation: {latitude: number; longitude: number} | null
): {groups: RestaurantGroup[]; totalDeliveryFee: number; totalFoodPrice: number} => {
  const groups: Record<number, RestaurantGroup> = {};
  let totalDeliveryFee = 0;
  let totalFoodPrice = 0;

  // 1. Gom nhóm theo Restaurant ID
  items.forEach((item) => {
    const rId = item.restaurant?.id;
    if (!rId || !item.product) return;

    if (!groups[rId]) {
      groups[rId] = {
        restaurantId: rId,
        restaurantName: item.restaurant?.name || "Nhà hàng",
        restaurantAddress: item.restaurant?.address || "",
        items: [],
        subtotal: 0,
        distance: 0,
        deliveryFee: 0,
      };
    }

    groups[rId].items.push(item);
    // Tính tổng tiền món ngay khi gom nhóm
    const itemTotal = (item.product.price || 0) * item.quantity;
    groups[rId].subtotal += itemTotal;
    totalFoodPrice += itemTotal;
  });

  // 2. Tính phí ship cho từng nhóm
  const resultGroups = Object.values(groups).map((group) => {
    // Lấy tọa độ quán từ item đầu tiên trong nhóm
    const resLat = Number(group.items[0].restaurant?.latitude);
    const resLng = Number(group.items[0].restaurant?.longitude);

    // Ưu tiên tọa độ từ địa chỉ đã chọn, nếu không có thì dùng GPS hiện tại
    const uLat = userAddress?.latitude ? Number(userAddress.latitude) : userLocation?.latitude;
    const uLng = userAddress?.longitude ? Number(userAddress.longitude) : userLocation?.longitude;

    let fee = 15000; // Phí mặc định
    let dist = 0;

    if (resLat && resLng && uLat && uLng) {
      dist = calculateDistance(uLat, uLng, resLat, resLng);
      fee = calculateDeliveryFee(dist);
    }

    totalDeliveryFee += fee;

    return {
      ...group,
      distance: dist,
      deliveryFee: fee,
    };
  });

  return {groups: resultGroups, totalDeliveryFee, totalFoodPrice};
};
