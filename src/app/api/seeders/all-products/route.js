import { NextRequest, NextResponse } from "next/server";
import products from "@/models/Products";
import dbConnect from "@/lib/db/connection";
import { authorizeRoles, isAuthenticatedUser } from "@/middlewares/auth";

export async function GET(req) {
  try {
    const user = await isAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Need to login as admin" },
        { status: 400 },
      );
    }

    authorizeRoles(user, "admin");

    await dbConnect();

    const allProducts = await products
      .find({})
      .sort({ updatedAt: -1 });

    return NextResponse.json(
      {
        success: true,
        allProducts,
        totalProducts: allProducts.length,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching admin products:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}