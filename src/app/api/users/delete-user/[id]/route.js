import { NextResponse } from "next/server";// Adjust path based on your project structure
import dbConnect from "@/lib/db/connection";
import User from "@/models/User";
import { authorizeRoles, isAuthenticatedUser } from '@/middlewares/auth';
export async function DELETE(req, { params }) {
  try {
    // Connect to the database inside the function
    await dbConnect();
    const activeUser = await isAuthenticatedUser(req)
    if (activeUser) {
      authorizeRoles(activeUser, 'admin', 'user')
    }
    const user = await User.findById(params.id);
    if (!user) {
      return NextResponse.json({ message: `User not found with id: ${params.id}` }, { status: 404 });
    }

    // Delete user from database
    await User.deleteOne({ _id: params.id });

    return NextResponse.json({ message: "User deleted successfully", user }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error deleting user", error }, { status: 500 });
  }
}
``
