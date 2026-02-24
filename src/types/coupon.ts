// src/types/coupon.ts
export interface Coupon {
  _id: string;
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumPurchase?: number;
  maximumDiscount?: number;
  startDate: string; // ISO date string
  endDate: string;   // ISO date string
  usageLimit?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}