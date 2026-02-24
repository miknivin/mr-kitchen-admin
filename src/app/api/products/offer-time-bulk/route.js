import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connection";
import Product from "@/models/Products";
import mongoose from "mongoose";

export async function PUT(req) {
  try {
    await dbConnect();

    // Get offerEndTime from query parameters
    const { searchParams } = new URL(req.url);
    const offerEndTime = searchParams.get("offerEndTime");

    // Validate offerEndTime
    let updateValue = null;
    if (offerEndTime) {
      const date = new Date(offerEndTime);
      if (isNaN(date.getTime())) {
        return NextResponse.json(
          { success: false, message: "Invalid offerEndTime format" },
          { status: 400 },
        );
      }
      updateValue = date;
    }

    console.log("Updating offerEndTime to:", updateValue);

    // Start a MongoDB session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Fetch all products
      const products = await Product.find().session(session);
      if (products.length === 0) {
        await session.commitTransaction();
        session.endSession();
        return NextResponse.json(
          { success: true, message: "No products found to update" },
          { status: 200 },
        );
      }

      // Initialize offerEndTime for documents missing the field
      const initializePromises = products.map(async (product) => {
        if (!("offerEndTime" in product)) {
          console.log(`Adding offerEndTime field to product: ${product._id}`);
          product.offerEndTime = null;
          await product.save({ session });
        }
      });

      await Promise.all(initializePromises);

      // Update offerEndTime for all products
      const updatePromises = products.map(async (product) => {
        const updatedProduct = await Product.findByIdAndUpdate(
          product._id,
          { $set: { offerEndTime: updateValue } },
          { new: true, runValidators: true, session },
        );
        return updatedProduct;
      });

      const updatedProducts = await Promise.all(updatePromises);

      console.log(
        `Updated ${updatedProducts.length} products with offerEndTime:`,
        updateValue,
      );

      // Check for any products where offerEndTime was not updated correctly
      const failedUpdates = updatedProducts.filter(
        (product) =>
          (updateValue &&
            product.offerEndTime?.toISOString() !==
              updateValue.toISOString()) ||
          (!updateValue && product.offerEndTime !== null),
      );

      if (failedUpdates.length > 0) {
        console.warn(
          "Some products failed to update offerEndTime:",
          failedUpdates.map((p) => p._id),
        );
      }

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();

      return NextResponse.json(
        {
          success: true,
          message: `Successfully updated offerEndTime for ${updatedProducts.length} products`,
          updatedProducts,
        },
        { status: 200 },
      );
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error("Error updating offerEndTime for products:", error);
    return NextResponse.json(
      { success: false, error: error.message, stack: error.stack },
      { status: 500 },
    );
  }
}
