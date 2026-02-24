import { NextResponse } from "next/server";
import { authorizeRoles, isAuthenticatedUser } from "@/middlewares/auth";
import SessionStartedOrder from "@/models/SessionStartedOrders";
import Order from "@/models/Order";

export async function GET(req) {
  try {
    const user = await isAuthenticatedUser(req);
    authorizeRoles(user, "admin", "user");
    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (error) {
    const statusCode = 401;
    return NextResponse.json(
      { success: false, message: error.message },
      { status: statusCode },
    );
  }
}
