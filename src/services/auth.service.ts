import {BaseApiService} from "@/src/base/BaseApiService";
import {apiClient} from "@config/api.client";
import {ENDPOINTS} from "@config/api.config";
import {AuthResponse, LoginRequest, RegisterRequest, User} from "../types";
// import {User, AuthResponse, LoginRequest, RegisterRequest} from "@types/index";

/**
 * Auth Service - Extends BaseApiService
 * Handles authentication operations
 */
class AuthServiceClass extends BaseApiService<User> {
  protected baseEndpoint = ENDPOINTS.AUTH.LOGIN.split("/login")[0]; // '/auth'

  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<{data: AuthResponse}>(ENDPOINTS.AUTH.LOGIN, credentials);
    return response.data.data;
  }

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<{data: AuthResponse}>(ENDPOINTS.AUTH.REGISTER, data);
    return response.data.data;
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
  }

  /**
   * Get current user
   */
  async getMe(): Promise<AuthResponse> {
    const response = await apiClient.get<{data: AuthResponse}>(ENDPOINTS.AUTH.ME);
    return response.data.data;
  }

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.put(ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      currentPassword,
      newPassword,
    });
  }

  /**
   * Refresh token (if implemented)
   */
  async refreshToken(): Promise<{token: string}> {
    const response = await apiClient.post<{data: {token: string}}>(`${this.baseEndpoint}/refresh`);
    return response.data.data;
  }
}

export const AuthService = new AuthServiceClass();
