import dbConnect from "@/lib/db/connection";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { authorizeRoles, isAuthenticatedUser } from "@/middlewares/auth";
export async function GET(req) {
  try {
    await dbConnect();
    const user = await isAuthenticatedUser(req);

    // Check if user is admin or user (temporarily allowing user for development)
    authorizeRoles(user, "admin");

    const users = await User.find().sort({ updatedAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      users,
      currentUser: {
        email: user.email,
        role: user.role
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Error in getAllUsers:", error);

    let status = 500;
    if (
      error.message === "You need to login to access this resource" ||
      error.message === "User not found. Please login again." ||
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      status = 401;
    } else if (error.message === "Not allowed") {
      status = 403;
    }

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal Server Error",
        errorName: error.name
      },
      { status },
    );
  }
}
