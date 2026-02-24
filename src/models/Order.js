import mongoose from "mongoose";

/**
 * Unified Order model — used by BOTH admin panel and client website.
 * This is the single source of truth for all order data.
 */
const orderSchema = new mongoose.Schema(
  {
    shippingInfo: {
      fullName: { type: String, required: false },
      address: { type: String, required: true },
      address2: { type: String, required: false },
      email: { type: String, required: false },
      state: { type: String, required: false },
      city: { type: String, required: true },
      phoneNo: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true, default: "India" },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    orderItems: [
      {
        name: { type: String, required: true },
        sku: { type: String, required: false },
        quantity: { type: Number, required: true },
        image: { type: String, required: false, default: "" },
        variant: { type: mongoose.Schema.Types.Mixed, required: false },
        price: { type: String, required: true },
        discountPrice: { type: String, required: false },
        // productId: stored as string (from client) or ObjectId ref (from admin)
        productId: { type: String, required: false },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: false, // optional — client orders may not have this
          ref: "products",
        },
      },
    ],
    paymentMethod: {
      type: String,
      required: [true, "Please select payment method"],
      enum: {
        values: ["COD", "Online"],
        message: "Please select COD or Online Payments",
      },
    },
    paymentInfo: {
      id: String,
      status: String,
    },
    itemsPrice: { type: Number, required: true, default: 0 },
    taxAmount: { type: Number, required: true, default: 0 },
    shippingAmount: { type: Number, required: true, default: 0 },
    totalAmount: { type: Number, required: true },
    couponApplied: { type: String, required: false, default: "No" },
    couponAppliedRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      required: false,
    },
    couponDiscount: { type: Number, default: 0 },
    orderStatus: {
      type: String,
      default: "Processing",
      enum: {
        values: [
          "Processing",
          "Shipped",
          "Delivered",
          "Cancelled",
          "Return Requested",
          "Return Approved",
          "Return Rejected",
          "Returned",
          "Refunded",
        ],
        message: "Please select valid order status",
      },
    },
    orderNotes: { type: String, required: false },
    waybill: { type: String, required: false, unique: true, sparse: true },
    invoiceURL: { type: String, required: false },
    delhiveryCurrentOrderStatus: { type: String, required: false },
    cancelOrReturnReason: { type: String, required: false },
    cancelledAt: { type: Date, required: false },
    returnRequestedAt: { type: Date, required: false },
    returnedAt: { type: Date, required: false },
    refundedAt: { type: Date, required: false },
    refundAmount: { type: Number, required: false },
    refundInfo: { id: String, status: String },
    orderTracking: [
      {
        Status: { type: String, required: false },
        StatusDateTime: { type: Date, required: false },
        StatusType: { type: String, required: false },
        StatusLocation: { type: String, required: false },
        Instructions: { type: String, required: false },
      },
    ],
    deliveredAt: Date,
  },
  { timestamps: true }
);

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
