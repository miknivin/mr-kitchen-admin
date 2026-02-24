import { NextResponse } from "next/server";
import Order from "@/models/Order";
import Product from "@/models/Products";
import User from "@/models/User";
import { authorizeRoles, isAuthenticatedUser } from "@/middlewares/auth";
import dbConnect from "@/lib/db/connection";

export async function GET(req) {
  try {
    await dbConnect();

    const user = await isAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Need to login" },
        { status: 400 }
      );
    }

    authorizeRoles(user, "admin");

    const totalOrders = await Order.countDocuments();

    const totalAmount = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalAmount" },
        },
      },
    ]);

    const totalProducts = await Product.countDocuments();

    const totalUsers = await User.countDocuments();

    return NextResponse.json(
      {
        success: true,
        totalOrders,
        totalAmount: totalAmount.length > 0 ? totalAmount[0].totalAmount : 0,
        totalProducts,
        totalUsers,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
