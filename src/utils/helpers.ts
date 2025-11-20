export const formatPrice = (price: number): string => {
  return price.toLocaleString("vi-VN");
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString("vi-VN");
};
