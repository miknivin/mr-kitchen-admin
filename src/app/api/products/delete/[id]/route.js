import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connection";
import Product from "@/models/Products";
import { invalidateProductCache } from "@/lib/cacheInvalidator";
export async function DELETE(req, { params }) {
  try {
    await dbConnect();

    const productId = params?.id;

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 },
      );
    }

    const product = await Product.findById(productId);

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 },
      );
    }
    await invalidateProductCache(product._id.toString());
    await Product.findByIdAndDelete(productId);

    return NextResponse.json(
      { success: true, message: "Product deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
