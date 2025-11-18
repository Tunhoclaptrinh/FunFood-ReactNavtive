import {ApiResponse} from "@types/api.types";
import {User} from "@types/models.types";
import client from "./client";

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponse {
  user: User;
  token: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export const authApi = {
  login: (payload: LoginPayload) => client.post<ApiResponse<LoginResponse>>("/auth/login", payload),

  register: (payload: RegisterPayload) => client.post<ApiResponse<LoginResponse>>("/auth/register", payload),

  getMe: () => client.get<ApiResponse<User>>("/auth/me"),

  logout: () => client.post<ApiResponse<null>>("/auth/logout"),

  changePassword: (currentPassword: string, newPassword: string) =>
    client.put<ApiResponse<null>>("/auth/change-password", {
      currentPassword,
      newPassword,
    }),
};
