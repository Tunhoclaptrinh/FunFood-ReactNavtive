export const calculateDeliveryFee = (distanceKm: number): number => {
  const baseFee = 15000;
  const perKm = 5000;
  const extraPerKm = 7000;

  if (distanceKm <= 2) return baseFee;
  if (distanceKm <= 5) return baseFee + Math.ceil(distanceKm - 2) * perKm;
  return baseFee + 3 * perKm + Math.ceil(distanceKm - 5) * extraPerKm;
};

/**
 * Validate phone number (Vietnam format)
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  // Vietnam phone format: 0912345678 or +84912345678
  const phoneRegex = /^(0|\+84)[0-9]{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
};

/**
 * Helper: Format phone number for display
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
};

/**
 * Helper: Calculate distance from current location
 */

export const toRad = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
