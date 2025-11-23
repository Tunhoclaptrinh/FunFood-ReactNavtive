import {BaseApiService, PaginatedResponse} from "@/src/base/BaseApiService";
import {apiClient} from "@config/api.client";
import {ENDPOINTS} from "@config/api.config";

export interface Promotion {
  id: number;
  code: string;
  description: string;
  discountType: "percentage" | "fixed" | "delivery";
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  validFrom: string;
  validTo: string;
  usageLimit?: number;
  perUserLimit?: number;
  isActive: boolean;
}

/**
 * Promotion Service - Extends BaseApiService
 */
class PromotionServiceClass extends BaseApiService<Promotion> {
  protected baseEndpoint = ENDPOINTS.PROMOTIONS.BASE;

  /**
   * Get active promotions
   */
  async getActivePromotions(): Promise<PaginatedResponse<Promotion>> {
    return this.filter({isActive: true});
  }

  /**
   * Validate promotion
   */
  async validatePromotion(code: string, orderValue: number, deliveryFee?: number): Promise<any> {
    const response = await apiClient.post<{data: any}>(ENDPOINTS.PROMOTIONS.VALIDATE, {code, orderValue, deliveryFee});
    return response.data.data;
  }

  /**
   * Get promotion by code
   */
  async getByCode(code: string): Promise<Promotion> {
    const response = await apiClient.get<{data: Promotion}>(`${this.baseEndpoint}/code/${code}`);
    return response.data.data;
  }

  /**
   * Check if promotion is valid
   */
  async checkValidity(code: string): Promise<boolean> {
    try {
      await this.getByCode(code);
      return true;
    } catch {
      return false;
    }
  }
}

export const PromotionService = new PromotionServiceClass();
