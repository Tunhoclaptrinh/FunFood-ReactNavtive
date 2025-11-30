// src/services/address.service.ts
import {BaseApiService, PaginatedResponse} from "@/src/base/BaseApiService";
import {apiClient} from "@config/api.client";
import {isValidPhoneNumber} from "../utils/helpers";

export interface Address {
  id: number;
  userId: number;
  label: string;
  address: string;
  recipientName: string;
  recipientPhone: string;
  latitude?: number;
  longitude?: number;
  note?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressRequest {
  label: string;
  address: string;
  recipientName: string;
  recipientPhone: string;
  latitude?: number;
  longitude?: number;
  note?: string;
  isDefault?: boolean;
}

export interface UpdateAddressRequest extends Partial<CreateAddressRequest> {}

/**
 * Validation Result
 */
interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Enhanced Address Service
 *
 * Features:
 * - Automatic error handling (no try-catch needed in UI)
 * - Built-in validation
 * - CRUD operations
 * - Default address management
 *
 * Usage:
 * ```typescript
 * // Get addresses - no try-catch needed!
 * const addresses = await AddressService.getAddresses();
 * if (addresses) {
 *   setAddresses(addresses.data);
 * }
 *
 * // Create address with validation
 * const validation = AddressService.validateAddress(formData);
 * if (!validation.isValid) {
 *   setErrors(validation.errors);
 *   return;
 * }
 *
 * const newAddress = await AddressService.createAddress(formData);
 * if (newAddress) {
 *   // Success!
 *   navigation.goBack();
 * }
 * ```
 */
class AddressServiceClass extends BaseApiService<Address> {
  protected baseEndpoint = "/addresses";

  /**
   * Get all user addresses
   * Returns paginated response or empty array on error
   */
  async getAddresses(params?: any): Promise<PaginatedResponse<Address>> {
    return this.getAll(params);
  }

  /**
   * Get default address
   * Returns null if not found or error occurs
   */
  async getDefaultAddress(): Promise<Address | null> {
    return this.safeCall(
      async () => {
        const data = await apiClient.get<Address>(`${this.baseEndpoint}/default`);
        return data;
      },
      null,
      {silent: true} // Don't show error if no default address
    );
  }

  /**
   * Get address by ID
   */
  async getAddressById(id: number): Promise<Address | null> {
    return this.getById(id);
  }

  /**
   * Create new address
   * Returns created address or null on error
   */
  async createAddress(data: CreateAddressRequest): Promise<Address | null> {
    return this.safeCall(async () => {
      const result = await apiClient.post<Address>(this.baseEndpoint, data);
      return result;
    }, null);
  }

  /**
   * Update address
   * Returns updated address or null on error
   */
  async updateAddress(id: number, data: UpdateAddressRequest): Promise<Address | null> {
    return this.update(id, data as any);
  }

  /**
   * Set address as default
   * Returns updated address or null on error
   */
  async setAsDefault(id: number): Promise<Address | null> {
    return this.safeCall(async () => {
      const result = await apiClient.patch<Address>(`${this.baseEndpoint}/${id}/default`);
      return result;
    }, null);
  }

  /**
   * Delete address
   * Returns true on success, false on error
   */
  async deleteAddress(id: number): Promise<boolean> {
    return this.delete(id);
  }

  /**
   * Search addresses by query
   */
  async searchAddresses(query: string): Promise<PaginatedResponse<Address>> {
    return this.search(query);
  }

  /**
   * Get address count
   */
  async getAddressCount(): Promise<number> {
    return this.count();
  }

  /**
   * Validate address data
   * Returns validation result with specific error messages
   *
   * Usage:
   * ```typescript
   * const validation = AddressService.validateAddress(formData);
   * if (!validation.isValid) {
   *   setErrors(validation.errors);
   *   return;
   * }
   * // Proceed with API call
   * ```
   */
  validateAddress(data: CreateAddressRequest): ValidationResult {
    const errors: Record<string, string> = {};

    // Label validation
    if (!data.label || data.label.trim().length === 0) {
      errors.label = "Nhãn địa chỉ là bắt buộc";
    } else if (data.label.length < 1 || data.label.length > 50) {
      errors.label = "Nhãn địa chỉ phải từ 1-50 ký tự";
    }

    // Address validation
    if (!data.address || data.address.trim().length === 0) {
      errors.address = "Địa chỉ là bắt buộc";
    } else if (data.address.length < 10 || data.address.length > 200) {
      errors.address = "Địa chỉ phải từ 10-200 ký tự";
    }

    // Recipient name validation
    if (!data.recipientName || data.recipientName.trim().length === 0) {
      errors.recipientName = "Tên người nhận là bắt buộc";
    } else if (data.recipientName.length < 2 || data.recipientName.length > 100) {
      errors.recipientName = "Tên người nhận phải từ 2-100 ký tự";
    }

    // Recipient phone validation
    if (!data.recipientPhone || data.recipientPhone.trim().length === 0) {
      errors.recipientPhone = "Số điện thoại là bắt buộc";
    } else if (isValidPhoneNumber(data.recipientPhone)) {
      errors.recipientPhone = "Số điện thoại không hợp lệ (VD: 0912345678)";
    }

    // Note validation (optional)
    if (data.note && data.note.length > 500) {
      errors.note = "Ghi chú không được vượt quá 500 ký tự";
    }

    // GPS validation (optional but should be valid if provided)
    if (data.latitude !== undefined && (data.latitude < -90 || data.latitude > 90)) {
      errors.latitude = "Latitude không hợp lệ (-90 đến 90)";
    }
    if (data.longitude !== undefined && (data.longitude < -180 || data.longitude > 180)) {
      errors.longitude = "Longitude không hợp lệ (-180 đến 180)";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Helper: Get address suggestions based on partial input
   */
  async getAddressSuggestions(query: string): Promise<Address[]> {
    if (query.length < 2) return [];

    const result = await this.search(query, {limit: 5});
    return result.data || [];
  }

  /**
   * Helper: Validate all addresses before batch operation
   */
  validateBatch(addresses: CreateAddressRequest[]): {
    valid: CreateAddressRequest[];
    invalid: Array<{index: number; data: CreateAddressRequest; errors: Record<string, string>}>;
  } {
    const valid: CreateAddressRequest[] = [];
    const invalid: Array<{index: number; data: CreateAddressRequest; errors: Record<string, string>}> = [];

    addresses.forEach((address, index) => {
      const validation = this.validateAddress(address);
      if (validation.isValid) {
        valid.push(address);
      } else {
        invalid.push({index, data: address, errors: validation.errors});
      }
    });

    return {valid, invalid};
  }
}

export const AddressService = new AddressServiceClass();
