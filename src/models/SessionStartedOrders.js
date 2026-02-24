import mongoose from "mongoose";

const sessionStartedOrderSchema = new mongoose.Schema(
  {
    razorpayOrderId: {
      type: String,
      required: true,
    },
    razorpayPaymentStatus: {
      type: String,
      default: "created",
    },
    shippingInfo: {
      fullName: { type: String, required: true },
      address: { type: String, required: true },
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
        quantity: { type: Number, required: true },
        image: { type: String, required: true },
        variant: {
          type: String,
          required: true,
        },
        price: { type: String, required: true },
        discountPrice: { type: String, required: false },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "products",
        },
      },
    ],
    paymentInfo: {
      id: String,
      status: String,
    },
    itemsPrice: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    orderNotes: { type: String, required: false },
    deliveredAt: Date,
  },
  { timestamps: true },
);

// Add index for faster search on razorpayOrderId
sessionStartedOrderSchema.index({ razorpayOrderId: 1 }, { unique: true });

const SessionStartedOrder =
  mongoose.models.SessionStartedOrder ||
  mongoose.model("SessionStartedOrder", sessionStartedOrderSchema);

export default SessionStartedOrder;
