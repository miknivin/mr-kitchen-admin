import { NextRequest, NextResponse } from "next/server";
import products from "@/models/Products";
import dbConnect from "@/lib/db/connection";
import { authorizeRoles, isAuthenticatedUser } from "@/middlewares/auth";

export async function GET(req) {
  try {
    await dbConnect();

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1") || 1;
    const limit = parseInt(url.searchParams.get("limit") || "10") || 10;
    const search = url.searchParams.get("keyword") || "";
    const category = url.searchParams.get("category") || "";

    const skip = (page - 1) * limit;

    // Build the query object
    const query = {};

    // Add search filter (case-insensitive search on product name)
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    // Add category filter (only if category is not empty)
    if (category) {
      query.category = category;
    }

    const allProducts = await products
      .find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalProducts = await products.countDocuments(query);

    return NextResponse.json(
      {
        success: true,
        allProducts,
        totalProducts,
        currentPage: page,
        totalPages: Math.ceil(totalProducts / limit),
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
