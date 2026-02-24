import { NextResponse } from "next/server";
import User from "@/models/User"; // Adjust path based on your project structure
import dbConnect from "@/lib/db/connection"; // Ensure this is your DB connection file
import { authorizeRoles, isAuthenticatedUser } from "@/middlewares/auth";

export async function PATCH(req, { params }) {
  try {
    // Connect to the database inside the function
    await dbConnect();

    // Authenticate user
    const user = await isAuthenticatedUser(req);
    if (user) {
      authorizeRoles(user, "admin", "user");
    }

    // Parse request body
    const { name, email, phone } = await req.json();

    // Update user data
    const updatedUser = await User.findByIdAndUpdate(
      params.id,
      { name, email, phone },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: updatedUser }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error updating user", error }, { status: 500 });
  }
}
