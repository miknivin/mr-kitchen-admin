import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import dbConnect from "@/lib/db/connection";
import Order from "@/models/Order";

const redis = Redis.fromEnv();

export async function POST(req) {
  // Validate internal API token
  const authHeader = req.headers.get("authorization");
  const expectedToken = process.env.INTERNAL_API_TOKEN;
  if (authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let payloadId;
  try {
    // Parse request JSON
    const body = await req.json();
    payloadId = body.payloadId;
    if (!payloadId) {
      return NextResponse.json(
        { message: "Missing payloadId" },
        { status: 400 },
      );
    }
  } catch (err) {
    return NextResponse.json(
      { message: "Invalid request body" },
      { status: 400 },
    );
  }

  let payload;
  try {
    payload = await redis.get(`delhivery:payload:${payloadId}`);
    if (!payload) {
      return NextResponse.json(
        { message: "Payload not found" },
        { status: 404 },
      );
    }

    // If payload is string, parse it
    payload = typeof payload === "string" ? JSON.parse(payload) : payload;
  } catch (err) {
    console.error(
      `Invalid JSON in Redis for payloadId ${payloadId}:`,
      payload,
      err,
    );
    await redis.del(`delhivery:payload:${payloadId}`);
    return NextResponse.json(
      { message: "Invalid payload format in Redis" },
      { status: 400 },
    );
  }

  try {
    const { Shipment } = payload;
    if (!Shipment || !Shipment.AWB || !Shipment.Status) {
      console.error(
        `Invalid payload structure for payloadId ${payloadId}:`,
        payload,
      );
      await redis.del(`delhivery:payload:${payloadId}`);
      return NextResponse.json(
        { message: "Invalid payload structure" },
        { status: 400 },
      );
    }

    const { AWB, Status, PickUpDate, NSLCode, Sortcode, ReferenceNo } =
      Shipment;

    // Connect to MongoDB
    await dbConnect();

    const statusUpdate = {
      Status: Status.Status,
      StatusDateTime: new Date(Status.StatusDateTime),
      StatusType: Status.StatusType,
      StatusLocation: Status.StatusLocation,
      Instructions: Status.Instructions || "",
    };

    // Update or create order
    await Order.findOneAndUpdate(
      { waybill: AWB },
      {
        $push: {
          orderTracking: {
            $each: [statusUpdate],
            $sort: { StatusDateTime: -1 },
          },
        },
        $set: {
          waybill: AWB,
          ...(Status.Status === "Delivered" && {
            deliveredAt: new Date(Status.StatusDateTime),
          }),
        },
      },
      { upsert: true, new: true },
    );

    // Remove payload from Redis after processing
    await redis.del(`delhivery:payload:${payloadId}`);

    return NextResponse.json({ message: "Processed" }, { status: 200 });
  } catch (error) {
    console.error("Processing error:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      console.error(
        `Duplicate waybill detected for ${payload?.Shipment?.AWB || "unknown"}`,
      );
      await redis.del(`delhivery:payload:${payloadId}`);
      return NextResponse.json(
        { message: "Duplicate waybill" },
        { status: 400 },
      );
    }

    await redis.del(`delhivery:payload:${payloadId}`);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
