import {API_CONFIG} from "@config/api.config";

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

export const formatDistance = (km: number): string => {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)}km`;
};

export const formatPhoneNumber = (phone: string): string => {
  return phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
};

/**
 * Chuyển đổi đường dẫn ảnh tương đối thành tuyệt đối
 * @param path Đường dẫn ảnh (vd: /uploads/...)
 * @returns Đường dẫn tuyệt đối (vd: http://.../uploads/...)
 */
export const getImageUrl = (path?: string): string | undefined => {
  if (!path) return undefined;

  // Nếu là ảnh từ thư viện (file://) hoặc ảnh online (http...) thì giữ nguyên
  if (path.startsWith("file://") || path.startsWith("http") || path.startsWith("blob:")) {
    return path;
  }

  // Lấy domain từ API_CONFIG.BASE_URL (loại bỏ phần /api ở cuối nếu có)
  const baseUrl = API_CONFIG.BASE_URL.replace("/api", "");

  // Đảm bảo không bị duplicate dấu /
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return `${baseUrl}${cleanPath}`;
};
