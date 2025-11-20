export type FavoriteType = "restaurant" | "product";

export interface Favorite {
  id: number;
  userId: number;
  type: FavoriteType;
  referenceId: number;
  createdAt: string;
}
