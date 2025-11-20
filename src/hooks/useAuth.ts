import {useCallback} from "react";
import {useAuthStore} from "@stores/authStore";
import {AuthService} from "@services/auth.service";
import {LoginRequest, RegisterRequest} from "../types";

export const useAuth = () => {
  const {user, token, isLoading, isAuthenticated, setUser, logout, restoreSession} = useAuthStore();

  const login = useCallback(
    async (credentials: LoginRequest) => {
      try {
        const result = await AuthService.login(credentials);
        await setUser(result.user, result.token);
        return result;
      } catch (error) {
        throw error;
      }
    },
    [setUser]
  );

  const register = useCallback(
    async (data: RegisterRequest) => {
      try {
        const result = await AuthService.register(data);
        await setUser(result.user, result.token);
        return result;
      } catch (error) {
        throw error;
      }
    },
    [setUser]
  );

  const signOut = useCallback(async () => {
    try {
      await AuthService.logout();
      await logout();
    } catch (error) {
      throw error;
    }
  }, [logout]);

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    signOut,
    restoreSession,
  };
};
