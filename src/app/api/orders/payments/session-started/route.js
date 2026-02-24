import Razorpay from "razorpay";
import User from "@/models/User";
import Order from "@/models/Order";
import { isAuthenticatedUser } from "@/middlewares/auth";
import SessionStartedOrder from "@/models/SessionStartedOrders";
import dbConnect from "@/lib/db/connection";

export async function POST(req) {
  const headers = {
    "Access-Control-Allow-Origin":
      process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3001",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  };

  try {
    const body = await req.json();
    await dbConnect();
    console.log("DB connected");

    const user = await isAuthenticatedUser(req);
    if (!user) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized user" }),
        {
          status: 401,
          headers,
        },
      );
    }

    const { orderData } = body;
    const { itemsPrice, shippingInfo, orderItems } = orderData;

    if (!itemsPrice || !orderItems) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
        headers,
      });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET_KEY,
    });

    const options = {
      amount: itemsPrice * 100,
      currency: "INR",
      receipt: `order_${Date.now()}`,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);

    const newOrder = new SessionStartedOrder({
      razorpayOrderId: order.id,
      razorpayPaymentStatus: order.status,
      user: user._id,
      orderItems,
      shippingInfo,
      itemsPrice,
      totalAmount: itemsPrice,
    });

    await newOrder.save();

    return new Response(JSON.stringify(order), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Failed to create order" }), {
      status: 500,
      headers,
    });
  }
}

export async function OPTIONS(req) {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin":
        process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3001",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}
