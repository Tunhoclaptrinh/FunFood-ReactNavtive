import {create} from "zustand";
import {StorageService} from "@utils/storage";
import {User} from "../types";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  setUser: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,

  setUser: async (user, token) => {
    await StorageService.setToken(token);
    await StorageService.setUser(user);
    set({user, token, isAuthenticated: true});
  },

  logout: async () => {
    await StorageService.clear();
    set({user: null, token: null, isAuthenticated: false});
  },

  restoreSession: async () => {
    set({isLoading: true});
    try {
      const token = await StorageService.getToken();
      const user = await StorageService.getUser();

      if (token && user) {
        set({user, token, isAuthenticated: true});
      }
    } finally {
      set({isLoading: false});
    }
  },
}));
