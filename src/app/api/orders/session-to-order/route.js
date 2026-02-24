import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connection";

import Order from "@/models/Order";
import SessionStartedOrder from "@/models/SessionStartedOrders";

export async function POST(request) {
  try {
    await dbConnect();

    const { sessionOrderId } = await request.json();

    if (!sessionOrderId) {
      return NextResponse.json(
        { error: "Session Order ID is required" },
        { status: 400 },
      );
    }

    const sessionOrder = await SessionStartedOrder.findById(sessionOrderId);

    if (!sessionOrder) {
      return NextResponse.json(
        { error: "Session order not found" },
        { status: 404 },
      );
    }

    // Prepare new Order document based on session order
    const newOrder = new Order({
      shippingInfo: {
        fullName: sessionOrder.shippingInfo.fullName,
        address: sessionOrder.shippingInfo.address,
        email: sessionOrder.shippingInfo.email,
        state: sessionOrder.shippingInfo.state,
        city: sessionOrder.shippingInfo.city,
        phoneNo: sessionOrder.shippingInfo.phoneNo,
        zipCode: sessionOrder.shippingInfo.zipCode,
        country: sessionOrder.shippingInfo.country || "India",
      },

      user: sessionOrder.user,

      orderItems: sessionOrder.orderItems.map((item) => ({
        name: item.name,
        sku: item.sku || undefined, // optional in new schema
        quantity: item.quantity,
        image: item.image,
        variant: item.variant,
        price: item.price, // kept as string (as in your schema)
        discountPrice: item.discountPrice,
        product: item.product,
      })),

      paymentMethod: "Online", // since it came from Razorpay

      paymentInfo: {
        id: sessionOrder.razorpayOrderId,
        status: sessionOrder.razorpayPaymentStatus || "captured", // adjust if needed
      },

      itemsPrice: sessionOrder.itemsPrice,
      taxAmount: 0, // ← you need to calculate or get from frontend/session
      shippingAmount: 0, // ← same as above
      totalAmount: sessionOrder.totalAmount,

      couponApplied: "No",
      couponDiscount: 0,

      orderStatus: "Processing",
      orderNotes: sessionOrder.orderNotes || "",

      deliveredAt: sessionOrder.deliveredAt,
    });

    const savedOrder = await newOrder.save();

    // Optional: Clean up session order after successful conversion
    await SessionStartedOrder.findByIdAndDelete(sessionOrderId);

    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully from session",
        orderId: savedOrder._id,
        order: savedOrder,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error converting session to order:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create order",
        message: error.message,
      },
      { status: 500 },
    );
  }
}
