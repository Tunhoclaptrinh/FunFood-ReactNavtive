import AsyncStorage from "@react-native-async-storage/async-storage";

export class StorageService {
  private static readonly TOKEN_KEY = "auth_token";
  private static readonly USER_KEY = "auth_user";

  static async setToken(token: string): Promise<void> {
    await AsyncStorage.setItem(this.TOKEN_KEY, token);
  }

  static async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem(this.TOKEN_KEY);
  }

  static async removeToken(): Promise<void> {
    await AsyncStorage.removeItem(this.TOKEN_KEY);
  }

  static async setUser(user: any): Promise<void> {
    await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  static async getUser(): Promise<any | null> {
    const user = await AsyncStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  static async removeUser(): Promise<void> {
    await AsyncStorage.removeItem(this.USER_KEY);
  }

  static async clear(): Promise<void> {
    await AsyncStorage.removeItem(this.TOKEN_KEY);
    await AsyncStorage.removeItem(this.USER_KEY);
  }
}
