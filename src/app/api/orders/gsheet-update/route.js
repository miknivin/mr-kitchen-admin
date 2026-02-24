import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connection";
import Order from "@/models/Order";

export async function POST(req) {
  await dbConnect();

  try {
    // Extract webhook data
    const { sheetName, row, column, newValue, columnCValue } = await req.json();

    // Log the incoming payload
    console.log("Webhook received:", {
      sheetName,
      row,
      column,
      newValue,
      columnCValue,
    });

    // Validate that columnCValue and newValue exist
    if (!columnCValue || !newValue) {
      return NextResponse.json(
        {
          error:
            "columnCValue (order ID) and newValue (order status) are required",
        },
        { status: 400 },
      );
    }

    // Get the token from the Authorization header
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1]; // Extract token after "Bearer "

    // Define the expected token (match with the one in Google Apps Script)
    const expectedToken =
      "803d7a40bb5086e57b6caf1a2f7815a4b41572ca4c16e7defc9c20cfee7ded3e"; // Replace with the same token

    // Validate the token
    if (!token || token !== expectedToken) {
      return NextResponse.json(
        { error: "Invalid or missing token" },
        { status: 403 },
      );
    }

    // Use columnCValue as the order _id and newValue as the orderStatus
    const id = columnCValue;
    const orderStatus = newValue;

    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    order.orderStatus = orderStatus;
    await order.save();

    return NextResponse.json({
      success: true,
      message: "Order status updated via webhook",
      order,
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
