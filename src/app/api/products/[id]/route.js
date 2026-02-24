import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connection";
import Product from "@/models/Products";
import User from "@/models/User";

export async function GET(req, { params }) {
  try {
    await dbConnect();

    const productId = params?.id;

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 },
      );
    }

    const productById = await Product.findById(productId)
      .populate({
        path: "reviews.user",
        select: "name email avatar", // Select only the fields you need
      })
      .populate({
        path: "user",
        select: "name email avatar",
      });

    if (!productById) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, productById }, { status: 200 });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
