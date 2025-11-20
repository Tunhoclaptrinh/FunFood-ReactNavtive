export const calculateDeliveryFee = (distanceKm: number): number => {
  const baseFee = 15000;
  const perKm = 5000;
  const extraPerKm = 7000;

  if (distanceKm <= 2) return baseFee;
  if (distanceKm <= 5) return baseFee + Math.ceil(distanceKm - 2) * perKm;
  return baseFee + 3 * perKm + Math.ceil(distanceKm - 5) * extraPerKm;
};

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
