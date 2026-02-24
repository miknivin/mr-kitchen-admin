import mongoose from "mongoose";
import Order from "@/models/Order";
import dbConnect from "@/lib/db/connection";

export async function POST(request) {
  try {
    // Connect to MongoDB
    await dbConnect();


    const payload = await request.json();
    console.log("Webhook received:", payload);

    // Extract relevant data from Shiprocket webhook payload
    const shiprocketOrderId = payload.order_id; // Shiprocket order ID
    const shiprocketStatus = payload.current_status; // Current status from Shiprocket

    // Map Shiprocket statuses to your schema's orderStatus
    const statusMap = {
      "Pickup Scheduled": "Processing",
      "Out For Pickup": "Processing",
      Picked: "Processing",
      Shipped: "Shipped",
      "In-Transit": "Shipped",
      "Reached at Destination Hub": "Shipped",
      "Out For Delivery": "Shipped",
      Delivered: "Delivered",
      Undelivered: "Processing", // Adjust based on your needs
    };

    const newStatus = statusMap[shiprocketStatus] || "Processing"; // Default to Processing if unmapped

    // Find and update the order in MongoDB
    const order = await Order.findOneAndUpdate(
      { shiprocketOrderId: shiprocketOrderId },
      {
        orderStatus: newStatus,
        ...(newStatus === "Delivered" && { deliveredAt: new Date() }), // Set deliveredAt if Delivered
      },
      { new: true }, // Return the updated document
    );

    if (!order) {
      return new Response(JSON.stringify({ message: "Order not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log(`Order ${shiprocketOrderId} updated to ${newStatus}`);
    return new Response(
      JSON.stringify({ message: "Order status updated successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
