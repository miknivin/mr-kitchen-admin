import { NextResponse } from "next/server";
import Product from "@/models/Products";
import dbConnect from "@/lib/db/connection";
import mongoose from "mongoose";
import { invalidateProductCache } from "@/lib/cacheInvalidator";

export async function POST(request, { params }) {
  try {
    await dbConnect();
    const { id, aPlusContentIndex } = params;
    const { images } = await request.json(); // Expect images array from frontend

    if (!images || images.length === 0) {
      return NextResponse.json(
        { success: false, error: "No images provided" },
        { status: 400 },
      );
    }

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    }

    // If aPlusContent array doesn't exist, initialize it
    if (!product.details.aPlusContent) {
      product.details.aPlusContent = [];
    }
    // If the aPlusContent section at the specified index doesn't exist, initialize it with a default title
    if (!product.details.aPlusContent[aPlusContentIndex]) {
      product.details.aPlusContent[aPlusContentIndex] = {
        title: "sample",
        images: [],
      };
    }

    // Ensure images have unique _id values
    const updatedImages = images.map((image) => ({
      ...image,
      _id: new mongoose.Types.ObjectId().toString(),
    }));

    // Update product with new images
    product.details.aPlusContent[aPlusContentIndex].images.push(
      ...updatedImages,
    );
    await invalidateProductCache(product._id.toString());
    await product.save();

    return NextResponse.json({
      success: true,
      updatedImages,
    });
  } catch (error) {
    console.error("Error updating A+ content images:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update images" },
      { status: 500 },
    );
  }
}
