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
