import {ApiResponse, AuthResponse, LoginRequest, RegisterRequest} from "../types";
import {apiClient} from "../config/api.client";
import {ENDPOINTS} from "@config/api.config";

export class AuthService {
  static async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(ENDPOINTS.AUTH.LOGIN, data);
    return response.data.data;
  }

  static async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(ENDPOINTS.AUTH.REGISTER, data);
    return response.data.data;
  }

  static async logout() {
    return await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
  }

  static async getMe(): Promise<AuthResponse> {
    const response = await apiClient.get<ApiResponse<AuthResponse>>(ENDPOINTS.AUTH.ME);
    return response.data.data;
  }

  static async changePassword(currentPassword: string, newPassword: string) {
    return await apiClient.put(ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      currentPassword,
      newPassword,
    });
  }
}
