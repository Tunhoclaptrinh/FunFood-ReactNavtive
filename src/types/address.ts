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
}
