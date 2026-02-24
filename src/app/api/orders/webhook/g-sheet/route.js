import { NextResponse } from "next/server";
import Order from "@/models/Order";
import dbConnect from "@/lib/db/connection";

// Server-side token (store in environment variables for security)
const API_TOKEN = process.env.GSHEET_API_TOKEN || "your-static-token-here";

// Middleware to verify token
async function verifyToken(req) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { success: false, message: "No token provided or invalid format" };
    }

    const token = authHeader.replace("Bearer ", "");

    // Compare token with server-side token
    if (token !== API_TOKEN) {
      return { success: false, message: "Invalid token" };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: "Token verification failed: " + error.message,
    };
  }
}

export async function GET(req) {
  try {
    await dbConnect();

    // Verify token
    const authResult = await verifyToken(req);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.message },
        { status: 401 },
      );
    }

    // Fetch all orders sorted by latest first
    const orders = await Order.find().sort({ createdAt: -1 });

    if (!orders) {
      return NextResponse.json(
        { success: false, message: "No orders found" },
        { status: 404 },
      );
    }

    if (orders.length === 0) {
      return NextResponse.json({ success: true, orders: [] }, { status: 200 });
    }

    return NextResponse.json({ success: true, orders }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
