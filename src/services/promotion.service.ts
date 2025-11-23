import {ENDPOINTS} from "../config/api.config";
import {apiClient} from "../config/api.client";

export class PromotionService {
  static async validatePromotion(code: string, orderValue: number, deliveryFee?: number) {
    const response = await apiClient.post<{data: any}>(ENDPOINTS.PROMOTIONS.VALIDATE, {
      code,
      orderValue,
      deliveryFee,
    });
    return response.data.data;
  }
}
