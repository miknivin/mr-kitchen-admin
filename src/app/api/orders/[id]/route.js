import { NextResponse } from "next/server";
import Order from "@/models/Order";
import { authorizeRoles, isAuthenticatedUser } from "@/middlewares/auth";
import dbConnect from "@/lib/db/connection";

export async function GET(req, { params }) {
    try {
        await dbConnect();

        const user = await isAuthenticatedUser(req);
        if (!user) {
            return NextResponse.json(
                { success: false, message: "Need to login" },
                { status: 400 }
            );
        }

        // Access the order ID directly from params
        const { id } = params;

        const order = await Order.findById(id).populate("user", "name email phone");

        // Check if order exists FIRST before accessing order.user
        if (!order) {
            return NextResponse.json(
                { success: false, message: "No order found with this ID" },
                { status: 404 }
            );
        }

        // Only check ownership if order.user is populated and user is not admin
        if (order.user && order.user._id && String(order.user._id) !== String(user._id)) {
            authorizeRoles(user, "admin");
        }

        return NextResponse.json(
            { success: true, order },
            { status: 200 }
        );
    } catch (error) {
        console.error("Get order error:", error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

