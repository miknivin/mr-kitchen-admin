import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connection";
import Product from "@/models/Products";
import { uploadFilesToS3 } from "../../utils/imageUpload/S3Upload";

export async function PATCH(req) {
  try {
    await dbConnect();

    const formData = await req.formData();
    const productId = formData.get("productId");
    const smallBagFile = formData.get("smallBagImage");
    const largeBagFile = formData.get("largeBagImage");
    const name = formData.get("name") || ""; 

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    let smallBagImageUrl = null;
    let largeBagImageUrl = null;

    if (smallBagFile) {
      const uploadedSmallBag = await uploadFilesToS3([smallBagFile]);
      if (uploadedSmallBag.length > 0) {
        smallBagImageUrl = uploadedSmallBag[0].url;
      }
    }

    if (largeBagFile) {
      const uploadedLargeBag = await uploadFilesToS3([largeBagFile]);
      if (uploadedLargeBag.length > 0) {
        largeBagImageUrl = uploadedLargeBag[0].url;
      }
    }

    // Check if at least one image was uploaded
    if (!smallBagImageUrl && !largeBagImageUrl) {
      return NextResponse.json(
        { error: "At least one image must be uploaded" },
        { status: 400 }
      );
    }

    // Prepare update object
    const updateData = {
      smallBagImage: smallBagImageUrl,
      largeBagImage: largeBagImageUrl,
      name: name,
    };

    // Update product with new images
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $push: { templateImages: updateData } },
      { new: true }
    );

    if (!updatedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Images uploaded successfully", product: updatedProduct },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}