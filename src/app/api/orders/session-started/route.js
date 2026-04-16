import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connection";
import SessionStartedOrder from "@/models/SessionStartedOrders";

export async function GET(request) {
  try {
    await dbConnect();

    // Return all SessionStartedOrders sorted by newest first
    // Note: converted orders are deleted by the session-to-order route, so no filtering needed
    const sessionOrders = await SessionStartedOrder.find().sort({
      createdAt: -1,
    });

    const response = NextResponse.json({
      success: true,
      data: sessionOrders,
      total: sessionOrders.length,
    });

    // Set cache-control headers after creating response
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 },
    );
  }
}

// Optional: Ensure dynamic rendering
export const dynamic = "force-dynamic";
