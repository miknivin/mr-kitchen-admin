import { NextResponse, NextRequest } from "next/server";
import { authorizeRoles, isAuthenticatedUser } from "@/middlewares/auth";
import dbConnect from "@/lib/db/connection";
import { OrderFilter } from "@/utlis/OrderFilter";
import Product from "@/models/Products";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    Product; // Ensure model is loaded (if needed for schema)
    User; // Ensure model is loaded (if needed for schema)
    await dbConnect();

    // Authenticate the user
    const user = await isAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Need to login" },
        { status: 400 },
      );
    }

    // Authorize admin or user role
    authorizeRoles(user, "admin", "user");

    // Extract filter options from request
    const filterOptions = OrderFilter.extractFilterOptions(req);

    // Apply filters and exclude orderTracking
    const orderFilter = new OrderFilter(filterOptions);
    const orders = await orderFilter
      .select("-orderTracking")
      .getFilteredOrders();

    if (!orders || orders.length === 0) {
      return NextResponse.json(
        { success: true, orders: [], message: "No orders found" },
        { status: 200 },
      );
    }

    return NextResponse.json({ success: true, orders }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
