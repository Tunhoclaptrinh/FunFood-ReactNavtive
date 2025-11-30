// src/config/api.client.ts
import axios, {AxiosInstance, AxiosError, AxiosRequestConfig} from "axios";
import {API_CONFIG} from "@config/api.config";
import {StorageService} from "@utils/storage";
import {Alert} from "react-native";

/**
 * Custom Error Class cho API
 */
class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errors?: Record<string, string>,
    public originalError?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * API Response Wrapper
 */
interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  statusCode?: number;
  errors?: Record<string, string>;
}

/**
 * Enhanced API Client với centralized error handling
 */
class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  }> = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request Interceptor
    this.client.interceptors.request.use(
      async (config) => {
        const token = await StorageService.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(this.handleError(error))
    );

    // Response Interceptor
    this.client.interceptors.response.use(
      (response) => this.handleSuccess(response),
      async (error) => this.handleResponseError(error)
    );
  }

  /**
   * Handle successful response
   */
  private handleSuccess(response: any) {
    // Log success in development
    if (__DEV__) {
      console.log(`✅ API Success: ${response.config.url}`, response.data);
    }
    return response;
  }

  /**
   * Handle response errors với retry logic
   */
  private async handleResponseError(error: AxiosError) {
    const originalRequest: any = error.config;

    // Network error
    if (!error.response) {
      this.showError("Lỗi kết nối", "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet.");
      throw new ApiError("Network Error", undefined, undefined, error);
    }

    const {status, data} = error.response as any;

    // Handle 401 - Unauthorized (Token expired)
    if (status === 401 && !originalRequest._retry) {
      if (this.isRefreshing) {
        return new Promise((resolve, reject) => {
          this.failedQueue.push({resolve, reject});
        })
          .then(() => this.client(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      this.isRefreshing = true;

      try {
        // Try to refresh token
        await this.refreshToken();
        this.processQueue(null);
        return this.client(originalRequest);
      } catch (refreshError) {
        this.processQueue(refreshError);
        await this.handleLogout();
        throw new ApiError("Session expired", 401);
      } finally {
        this.isRefreshing = false;
      }
    }

    // Handle other status codes
    return Promise.reject(this.handleError(error));
  }

  /**
   * Process failed request queue after token refresh
   */
  private processQueue(error: any) {
    this.failedQueue.forEach((promise) => {
      if (error) {
        promise.reject(error);
      } else {
        promise.resolve();
      }
    });
    this.failedQueue = [];
  }

  /**
   * Refresh token
   */
  private async refreshToken() {
    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/auth/refresh`);
      const {token} = response.data.data;
      await StorageService.setToken(token);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Handle logout
   */
  private async handleLogout() {
    await StorageService.clear();
    // Trigger app-wide logout event
    // You can use EventEmitter or navigation reset here
  }

  /**
   * Centralized error handling
   */
  private handleError(error: AxiosError): ApiError {
    const response = error.response as any;
    const data = response?.data;

    // Extract error message and details
    const message = data?.message || error.message || "Đã có lỗi xảy ra";
    const statusCode = response?.status;
    const errors = data?.errors;

    // Log error in development
    if (__DEV__) {
      console.error(`❌ API Error: ${error.config?.url}`, {
        status: statusCode,
        message,
        errors,
      });
    }

    // Show user-friendly error messages
    this.showErrorByStatus(statusCode, message, errors);

    return new ApiError(message, statusCode, errors, error);
  }

  /**
   * Show error alerts based on status code
   */
  private showErrorByStatus(status?: number, message?: string, errors?: Record<string, string>) {
    // Don't show alerts for certain status codes in production
    const silentStatuses = [401, 404];
    if (!__DEV__ && status && silentStatuses.includes(status)) {
      return;
    }

    let title = "Lỗi";
    let description = message || "Đã có lỗi xảy ra";

    switch (status) {
      case 400:
        title = "Dữ liệu không hợp lệ";
        if (errors) {
          description = Object.values(errors).join("\n");
        }
        break;
      case 401:
        title = "Chưa đăng nhập";
        description = "Vui lòng đăng nhập để tiếp tục";
        break;
      case 403:
        title = "Không có quyền truy cập";
        description = "Bạn không có quyền thực hiện thao tác này";
        break;
      case 404:
        title = "Không tìm thấy";
        description = "Dữ liệu không tồn tại";
        break;
      case 409:
        title = "Xung đột dữ liệu";
        break;
      case 422:
        title = "Xác thực thất bại";
        if (errors) {
          description = Object.values(errors).join("\n");
        }
        break;
      case 429:
        title = "Quá nhiều yêu cầu";
        description = "Vui lòng thử lại sau";
        break;
      case 500:
      case 502:
      case 503:
        title = "Lỗi máy chủ";
        description = "Máy chủ đang gặp sự cố. Vui lòng thử lại sau";
        break;
    }

    this.showError(title, description);
  }

  /**
   * Show error alert
   */
  private showError(title: string, message: string) {
    // Use setTimeout to avoid blocking the promise chain
    setTimeout(() => {
      Alert.alert(title, message, [{text: "OK"}]);
    }, 100);
  }

  // ==================== PUBLIC METHODS ====================

  /**
   * GET request
   */
  async get<T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, {
      params,
      ...config,
    });
    return this.extractData(response);
  }

  /**
   * POST request
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return this.extractData(response);
  }

  /**
   * PUT request
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return this.extractData(response);
  }

  /**
   * PATCH request
   */
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return this.extractData(response);
  }

  /**
   * DELETE request
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return this.extractData(response);
  }

  /**
   * Upload file (multipart/form-data)
   */
  async upload<T = any>(url: string, formData: FormData, onProgress?: (progress: number) => void): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });
    return this.extractData(response);
  }

  /**
   * Extract data from response
   */
  private extractData<T>(response: any): T {
    const {data} = response;

    // Handle different response formats from backend
    if (data?.data !== undefined) {
      return data.data; // Backend format: { success, data: {...} }
    }

    if (data?.success !== undefined) {
      return data; // Backend format: { success, count, data: [...] }
    }

    return data; // Direct data
  }

  /**
   * Get raw axios instance (for special cases)
   */
  getRawClient(): AxiosInstance {
    return this.client;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export {ApiError};
