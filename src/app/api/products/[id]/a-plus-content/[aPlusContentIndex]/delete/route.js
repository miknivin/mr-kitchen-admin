import { NextResponse } from "next/server";
import Product from "@/models/Products";
import dbConnect from "@/lib/db/connection";
import AWS from "aws-sdk";
import { invalidateProductCache } from "@/lib/cacheInvalidator";

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || "eu-north-1", // Updated region
});

const s3 = new AWS.S3();

export async function POST(request, { params }) {
  try {
    await dbConnect();
    const { id, aPlusContentIndex } = params;
    const { imageId } = await request.json();

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    }

    if (!product.details.aPlusContent[aPlusContentIndex]) {
      return NextResponse.json(
        { success: false, error: "A+ content section not found" },
        { status: 400 },
      );
    }

    const image = product.details.aPlusContent[aPlusContentIndex].images.find(
      (img) => img._id === imageId,
    );

    if (!image) {
      return NextResponse.json(
        { success: false, error: "Image not found" },
        { status: 404 },
      );
    }

    // Delete from S3
    const fileKey = image.public_id; // public_id is the S3 key
    await s3
      .deleteObject({
        Bucket: process.env.AWS_BUCKET_NAME || "kids-bags", // Updated bucket name
        Key: fileKey,
      })
      .promise();

    // Remove from product
    product.details.aPlusContent[aPlusContentIndex].images =
      product.details.aPlusContent[aPlusContentIndex].images.filter(
        (img) => img._id !== imageId,
      );
    await invalidateProductCache(product._id.toString());
    await product.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting A+ content image:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete image" },
      { status: 500 },
    );
  }
}
