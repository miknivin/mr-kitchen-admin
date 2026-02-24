// app/api/admin/orders/[id]/approve-return/route.js

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connection";

import { isAuthenticatedUser, authorizeRoles } from "@/middlewares/auth";
import Order from './../../../../../models/Order';
import mongoose from "mongoose";

export async function PATCH(req, { params }) {
  await dbConnect();

  try {
    // Authenticate and ensure user is admin
    const user = await isAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    authorizeRoles(user, "admin");

    const { id } = params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid order ID" },
        { status: 400 }
      );
    }

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Only allow approval if current status is "Return Requested"
    if (order.orderStatus !== "Return Requested") {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot approve return. Current status is "${order.orderStatus}"`,
        },
        { status: 400 }
      );
    }

    // Update status and timestamp
    order.orderStatus = "Return Approved";
    order.returnApprovedAt = new Date();

    // Optional: Add tracking entry for audit
    order.orderTracking.push({
      Status: "Return Approved",
      StatusDateTime: new Date(),
      StatusType: "Return",
      StatusLocation: "N/A",
      Instructions: "Return approved by admin",
    });

    await order.save();

    return NextResponse.json({
      success: true,
      message: "Return approved successfully",
      order,
    });
  } catch (error) {
    console.error("Error approving return:", error);
    return NextResponse.json(
      { success: false, error: "Server error while approving return" },
      { status: 500 }
    );
  }
}