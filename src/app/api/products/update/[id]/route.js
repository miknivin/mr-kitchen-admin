import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connection";
import Product from "@/models/Products";
import { invalidateProductCache } from "@/lib/cacheInvalidator";

export async function PUT(req, { params }) {
  try {
    await dbConnect();

    const productId = params?.id;
    const body = await req.json();

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 },
      );
    }

    // Fetch the current product (to preserve images)
    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 },
      );
    }

    // Exclude images from the update request
    delete body.images;

    // Ensure offerEndTime is a valid Date if provided
    if (body.offerEndTime) {
      const date = new Date(body.offerEndTime);
      if (isNaN(date.getTime())) {
        return NextResponse.json(
          { success: false, message: "Invalid offerEndTime format" },
          { status: 400 },
        );
      }
      body.offerEndTime = date; // Convert to Date object for Mongoose
    } else {
      body.offerEndTime = null; // Explicitly set to null if not provided
    }

    await invalidateProductCache(productId);

    // Perform the update
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $set: body },
      { new: true, runValidators: true },
    );

    if (!updatedProduct) {
      return NextResponse.json(
        { success: false, message: "Failed to update product" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Product updated successfully",
        product: updatedProduct,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { success: false, error: error.message, stack: error.stack },
      { status: 500 },
    );
  }
}
