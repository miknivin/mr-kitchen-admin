import { Types } from "mongoose";

export interface ShippingInfo {
  fullName?: string;
  address: string;
  address2?: string;
  email?: string;
  state?: string;
  city: string;
  phoneNo: string;
  zipCode: string;
  country: string; // default: "India"
}

export interface OrderItem {
  name: string;
  sku?: string;
  quantity: number;
  image: string;
  variant: string | any;
  price: string; // Schema uses String, not Number
  discountPrice?: string;
  product: string | Types.ObjectId; // ref: "products"
}

export interface PaymentInfo {
  id?: string;
  status?: string;
}

export interface OrderTracking {
  Status?: string;
  StatusDateTime?: Date;
  StatusType?: string;
  StatusLocation?: string;
  Instructions?: string;
}

export interface Order {
  _id: string;
  shippingInfo: ShippingInfo;
  user: Types.ObjectId | string;
  orderItems: OrderItem[];
  paymentMethod: "COD" | "Online";
  paymentInfo?: PaymentInfo;
  itemsPrice: number;
  taxAmount: number;
  shippingAmount: number;
  totalAmount: number;
  couponApplied?: string; // default: "No"
  couponAppliedRef?: Types.ObjectId | string; // Reference to Coupon model
  couponDiscount?: number; // default: 0

  // Full order status enum including return flow
  orderStatus:
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled"
  | "Return Requested"
  | "Return Approved"
  | "Return Rejected"
  | "Returned"
  | "Refunded";

  // Reasons
  returnReason?: string; // Customer reason for return
  cancelReason?: string; // Reason for cancellation (separate from return)

  // Return & Cancellation timestamps
  returnRequestedAt?: Date;
  returnApprovedAt?: Date;
  returnRejectedAt?: Date;
  returnedAt?: Date; // Physical return received
  refundedAt?: Date; // Refund processed
  cancelledAt?: Date;

  orderNotes?: string;
  waybill?: string;
  invoiceURL?: string;
  delhiveryCurrentOrderStatus?: string; // Latest status synced from Delhivery
  orderTracking?: OrderTracking[]; // Array of tracking events stored in DB
  cancelOrReturnReason?: string;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
}
