export interface Repository<T> {
  items: T[];
  add(item: T): void;
  remove(id: string | number, idField?: string): void;
  update(id: string | number, item: Partial<T>, idField?: string): void;
  getById(id: string | number, idField?: string): T | null;
  getAll(): T[];
  clear(): void;
  filter(predicate: (item: T) => boolean): T[];
  count(): number;
}

/**
 * Base Repository - In-memory data management
 * Useful for caching API responses or managing local state
 */
export class BaseRepository<T> implements Repository<T> {
  items: T[] = [];

  add(item: T): void {
    this.items.push(item);
  }

  remove(id: string | number, idField: string = "id"): void {
    this.items = this.items.filter((item) => (item as any)[idField] !== id);
  }

  update(id: string | number, updates: Partial<T>, idField: string = "id"): void {
    const index = this.items.findIndex((item) => (item as any)[idField] === id);
    if (index !== -1) {
      this.items[index] = {...this.items[index], ...updates};
    }
  }

  getById(id: string | number, idField: string = "id"): T | null {
    return this.items.find((item) => (item as any)[idField] === id) || null;
  }

  getAll(): T[] {
    return [...this.items];
  }

  clear(): void {
    this.items = [];
  }

  filter(predicate: (item: T) => boolean): T[] {
    return this.items.filter(predicate);
  }

  count(): number {
    return this.items.length;
  }

  /**
   * Get paginated items
   */
  getPaginated(
    page: number = 1,
    limit: number = 10
  ): {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } {
    const total = this.items.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;

    return {
      items: this.items.slice(start, end),
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Sort items
   */
  sort(field: keyof T, order: "asc" | "desc" = "asc"): T[] {
    const sorted = [...this.items];
    sorted.sort((a, b) => {
      if (a[field] < b[field]) return order === "asc" ? -1 : 1;
      if (a[field] > b[field]) return order === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }

  /**
   * Search items by field
   */
  search(field: keyof T, value: any): T[] {
    return this.items.filter((item) => String(item[field]).toLowerCase().includes(String(value).toLowerCase()));
  }
}
