import Product from "@/models/Products";
import dbConnect from "@/lib/db/connection";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { authorizeRoles, isAuthenticatedUser } from "@/middlewares/auth";
import { invalidateProductCache } from "@/lib/cacheInvalidator";
export async function PUT(req, { params }) {
  const { id } = params;
  const { imageId } = await req.json();

  if (
    !mongoose.Types.ObjectId.isValid(id) ||
    !mongoose.Types.ObjectId.isValid(imageId)
  ) {
    return NextResponse.json(
      { error: "Invalid product or image ID" },
      { status: 400 },
    );
  }

  try {
    await dbConnect();
    const user = await isAuthenticatedUser(req);
    //console.log(user);

    if (user) {
      authorizeRoles(user, "admin");
    }
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $pull: { images: { _id: imageId } } },
      { new: true },
    );
    await invalidateProductCache(id);
    if (!updatedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    console.error("Error deleting product image:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
