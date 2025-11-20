export type UserRole = "customer" | "admin" | "manager" | "shipper";

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  avatar: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends LoginRequest {
  name: string;
  phone: string;
  address?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
