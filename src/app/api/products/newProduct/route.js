import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connection";
import Product from "@/models/Products";
import { authorizeRoles, isAuthenticatedUser } from "@/middlewares/auth";
import { invalidateProductCache } from "@/lib/cacheInvalidator";

export async function POST(req) {
  try {
    await dbConnect();

    const body = await req.json();

    const user = await isAuthenticatedUser(req);

    if (user) {
      authorizeRoles(user, "admin");
    }

    // Generate unique SKU if missing, to avoid potential DB index conflicts (since unique index might still persist)
    if (!body.sku) {
      body.sku = "SKU-" + Date.now() + Math.floor(Math.random() * 1000);
    }

    let images = [];
    if (body.images && Array.isArray(body.images)) {
      images = body.images.map((img) => {
        if (typeof img === "string") return { url: img };
        return img;
      });
    }
    body.images = images;
    body.user = user._id;
    await invalidateProductCache();
    const product = await Product.create(body);

    return NextResponse.json(
      {
        success: true,
        product,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}
