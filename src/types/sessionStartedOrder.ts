// types/sessionStartedOrder.ts

import { ObjectId } from "mongoose";

// Base interface for shipping information
export interface ShippingInfo {
  fullName?: string;
  address: string;
  email?: string;
  state?: string;
  city: string;
  phoneNo: string;
  zipCode: string;
  country: string;
}

// Interface for order items
export interface OrderItem {
  name: string;
  uploadedImage: string[];
  quantity: number;
  image: string;
  variant?: string | any;
  price: string;
  discountPrice?: string;
  product: ObjectId | string; // Can be ObjectId or string depending on population
}

// Interface for payment information
export interface PaymentInfo {
  id?: string;
  status?: string;
}

// Main SessionStartedOrder interface
export interface SessionStartedOrder {
  _id: string;
  razorpayOrderId: string;
  razorpayPaymentStatus: string;
  shippingInfo: ShippingInfo;
  user: ObjectId | string; // Can be ObjectId or string depending on population
  orderItems: OrderItem[];
  paymentInfo?: PaymentInfo;
  itemsPrice: number;
  totalAmount: number;
  orderNotes?: string;
  deliveredAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}
