import axios, {AxiosInstance} from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {ENV} from "../config/env";

const API_BASE_URL = ENV.API_URL;

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor - thêm token
    this.instance.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - xử lý lỗi
    this.instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired - logout
          await AsyncStorage.removeItem("authToken");
          // TODO: Dispatch logout action
        }
        return Promise.reject(error);
      }
    );
  }

  get client() {
    return this.instance;
  }
}

export default new ApiClient().client;
