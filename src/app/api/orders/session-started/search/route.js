import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connection";
import SessionStartedOrder from "@/models/SessionStartedOrders";

export async function GET(request) {
  try {
    await dbConnect();

    // Extract the keyword from the URL search parameters
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get("keyword");

    // If no keyword is provided, return an error
    if (!keyword) {
      return NextResponse.json(
        { error: "Keyword is required" },
        { status: 400 },
      );
    }

    // Use aggregation pipeline to search across fields
    const sessionOrders = await SessionStartedOrder.aggregate([
      // Populate the user field to search user-related fields
      {
        $lookup: {
          from: "users", // The collection name for the User model (lowercase, pluralized by Mongoose)
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      // Unwind the user array (since $lookup returns an array)
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true, // Keep documents even if user is not found
        },
      },
      // Add a temporary field to convert createdAt to string for searching
      {
        $addFields: {
          createdAtString: { $toString: "$createdAt" },
        },
      },
      // Match the keyword across fields
      {
        $match: {
          $or: [
            { razorpayOrderId: { $regex: keyword, $options: "i" } },
            { razorpayPaymentStatus: { $regex: keyword, $options: "i" } },
            { "shippingInfo.fullName": { $regex: keyword, $options: "i" } },
            { "shippingInfo.email": { $regex: keyword, $options: "i" } },
            { "shippingInfo.address": { $regex: keyword, $options: "i" } },
            { "shippingInfo.city": { $regex: keyword, $options: "i" } },
            { "shippingInfo.state": { $regex: keyword, $options: "i" } },
            { "shippingInfo.phoneNo": { $regex: keyword, $options: "i" } },
            { "shippingInfo.zipCode": { $regex: keyword, $options: "i" } },
            { "shippingInfo.country": { $regex: keyword, $options: "i" } },
            { "orderItems.name": { $regex: keyword, $options: "i" } },
            { orderNotes: { $regex: keyword, $options: "i" } },
            { "user.name": { $regex: keyword, $options: "i" } },
            { "user.email": { $regex: keyword, $options: "i" } },
            { createdAtString: { $regex: keyword, $options: "i" } },
          ],
        },
      },
      // Sort by createdAt descending
      {
        $sort: { createdAt: -1 },
      },
    ]);

    // Create response
    const response = NextResponse.json({
      success: true,
      data: sessionOrders,
      total: sessionOrders.length,
    });

    // Set cache-control headers
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 },
    );
  }
}

export const dynamic = "force-dynamic";
