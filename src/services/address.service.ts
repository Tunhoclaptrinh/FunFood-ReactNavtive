import {BaseApiService, PaginatedResponse} from "@/src/base/BaseApiService";
import {apiClient} from "@config/api.client";

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
 * Address Service - Extends BaseApiService
 *
 * Features:
 * - CRUD operations for addresses
 * - Get default address
 * - Set address as default
 * - Validation with backend schema
 *
 * Usage:
 * ```typescript
 * // Get all addresses
 * const addresses = await AddressService.getAddresses();
 *
 * // Create new address
 * await AddressService.createAddress({
 *   label: "Home",
 *   address: "123 Main St",
 *   recipientName: "John Doe",
 *   recipientPhone: "0912345678",
 *   isDefault: true
 * });
 *
 * // Get default address
 * const defaultAddr = await AddressService.getDefaultAddress();
 * ```
 */
class AddressServiceClass extends BaseApiService<Address> {
  protected baseEndpoint = "/addresses";

  /**
   * Get all user addresses
   */
  async getAddresses(params?: any): Promise<PaginatedResponse<Address>> {
    return this.getAll(params);
  }

  /**
   * Get default address
   */
  async getDefaultAddress(): Promise<Address | null> {
    try {
      const response = await apiClient.get<{data: Address}>(`${this.baseEndpoint}/default`);
      return response.data.data;
    } catch (error) {
      console.error("Error getting default address:", error);
      return null;
    }
  }

  /**
   * Get address by ID
   */
  async getAddressById(id: number): Promise<Address> {
    return this.getById(id);
  }

  /**
   * Create new address
   */
  async createAddress(data: CreateAddressRequest): Promise<Address> {
    const response = await apiClient.post<{data: Address}>(this.baseEndpoint, data);
    return response.data.data;
  }

  /**
   * Update address
   */
  async updateAddress(id: number, data: UpdateAddressRequest): Promise<Address> {
    return this.update(id, data as any);
  }

  /**
   * Set address as default
   */
  async setAsDefault(id: number): Promise<Address> {
    const response = await apiClient.patch<{data: Address}>(`${this.baseEndpoint}/${id}/default`);
    return response.data.data;
  }

  /**
   * Delete address
   */
  async deleteAddress(id: number): Promise<void> {
    await this.delete(id);
  }

  /**
   * Validate address data before submit
   */
  validateAddress(data: CreateAddressRequest): {isValid: boolean; errors: Record<string, string>} {
    const errors: Record<string, string> = {};

    // Label validation
    if (!data.label || data.label.trim().length === 0) {
      errors.label = "Label is required";
    } else if (data.label.length < 1 || data.label.length > 50) {
      errors.label = "Label must be between 1-50 characters";
    }

    // Address validation
    if (!data.address || data.address.trim().length === 0) {
      errors.address = "Address is required";
    } else if (data.address.length < 10 || data.address.length > 200) {
      errors.address = "Address must be between 10-200 characters";
    }

    // Recipient name validation
    if (!data.recipientName || data.recipientName.trim().length === 0) {
      errors.recipientName = "Recipient name is required";
    } else if (data.recipientName.length < 2 || data.recipientName.length > 100) {
      errors.recipientName = "Recipient name must be between 2-100 characters";
    }

    // Recipient phone validation
    if (!data.recipientPhone || data.recipientPhone.trim().length === 0) {
      errors.recipientPhone = "Phone number is required";
    } else if (!/^(0|\+84)[0-9]{9}$/.test(data.recipientPhone)) {
      errors.recipientPhone = "Invalid phone number format (e.g., 0912345678)";
    }

    // Note validation (optional)
    if (data.note && data.note.length > 500) {
      errors.note = "Note must not exceed 500 characters";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
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
}

export const AddressService = new AddressServiceClass();
