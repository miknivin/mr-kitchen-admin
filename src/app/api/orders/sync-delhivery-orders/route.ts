import { NextRequest, NextResponse } from "next/server";
import { syncDelhiveryOrders } from "@/utlis/syncDelhiveryOrders";
import dbConnect from "@/lib/db/connection";
import { isAuthenticatedUser, authorizeRoles } from "@/middlewares/auth";

export async function POST(req: NextRequest) {
  await dbConnect();

  // Authenticate the user
  try {
    const user = await isAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized: Need to login" },
        { status: 401 },
      );
    }

    // Authorize admin role
    authorizeRoles(user, "admin");

    // Parse request body
    const { waybill } = await req.json();
    const result = await syncDelhiveryOrders(waybill);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Frontend sync error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to sync orders" },
      {
        status:
          error.message.includes("login") || error.message.includes("allowed")
            ? 401
            : 500,
      },
    );
  }
}
