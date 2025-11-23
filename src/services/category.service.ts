import {BaseApiService, PaginatedResponse} from "@/src/base/BaseApiService";

export interface Category {
  id: number;
  name: string;
  icon?: string;
  image?: string;
  description?: string;
  totalRestaurants?: number;
}

class CategoryServiceClass extends BaseApiService<Category> {
  protected baseEndpoint = "/categories";

  /**
   * Get all categories
   */
  async getCategories(): Promise<Category[]> {
    const response = await this.getAll({_limit: 100});
    return response.data;
  }

  /**
   * Get category with restaurants count
   */
  async getCategoryWithStats(id: number): Promise<Category> {
    return this.getById(id);
  }

  /**
   * Search categories
   */
  async searchCategories(query: string): Promise<PaginatedResponse<Category>> {
    return this.search(query);
  }
}

export const CategoryService = new CategoryServiceClass();
