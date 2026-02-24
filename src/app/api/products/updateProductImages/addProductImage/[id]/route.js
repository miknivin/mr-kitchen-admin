import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { uploadFilesToS3 } from "../../../../utils/imageUpload/S3Upload";
import dbConnect from "@/lib/db/connection";
import Product from "@/models/Products";
import { authorizeRoles, isAuthenticatedUser } from "@/middlewares/auth";
import { invalidateProductCache } from "@/lib/cacheInvalidator";
export async function PATCH(req, { params }) {
  const { id } = params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
  }

  try {
    await dbConnect();
    const user = await isAuthenticatedUser(req);
    //console.log(user);

    if (user) {
      authorizeRoles(user, "admin");
    }
    const formData = await req.formData();
    const files = formData.getAll("images");

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No images provided" },
        { status: 400 },
      );
    }

    const uploadedImages = await uploadFilesToS3(files);

    await invalidateProductCache(id);

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $push: { images: { $each: uploadedImages } } },
      { new: true },
    );

    if (!updatedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    console.error("Error updating product images:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
