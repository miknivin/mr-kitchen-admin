// src/app/api/orders/webhook/[orderId]/delhivery/route.ts
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db/connection";
import Order from "@/models/Order";
import { createDelhiveryShipment } from "@/utlis/createDelhiveryShipment";

const INTERNAL_API_TOKEN = process.env.INTERNAL_API_TOKEN;
const DELHIVERY_API_TOKEN = process.env.DELHIVERY_API_TOKEN;

export async function POST(
  request: Request,
  { params }: { params: { orderId: string } },
) {
  try {
    // 1. Validate internal token
    const authHeader = request.headers.get("x-internal-token");
    if (!INTERNAL_API_TOKEN || authHeader !== INTERNAL_API_TOKEN) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { orderId } = params;
    if (!orderId || !mongoose.isValidObjectId(orderId)) {
      return NextResponse.json(
        { success: false, message: "Invalid order ID" },
        { status: 400 },
      );
    }

    await dbConnect();

    // 2. Fetch order
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 },
      );
    }

    // 3. Prevent duplicate
    if (order.waybill) {
      return NextResponse.json(
        { success: true, message: "Already shipped", waybill: order.waybill },
        { status: 200 },
      );
    }

    // 4. Build shipmentData from order
    const totalQuantity = order.orderItems.reduce(
      (t: number, i: any) => t + i.quantity,
      0,
    );
    const weight = totalQuantity * 300;

    const shipmentData = {
      shipments: [
        {
          name: order.shippingInfo.fullName || "Customer",
          add: order.shippingInfo.address,
          pin: order.shippingInfo.zipCode,
          city: order.shippingInfo.city,
          state: order.shippingInfo.state || "Unknown",
          country: order.shippingInfo.country || "India",
          phone: order.shippingInfo.phoneNo,
          order: order._id.toString(),
          payment_mode: order.paymentMethod === "COD" ? "COD" : "Prepaid",
          return_pin: "678583",
          return_city: "Thachanattukara",
          return_phone: "9778766273",
          return_add:
            "Florenza Italiya Near ABS Traders Kodakkad, Opp: Rifa Medical Center Kodakkad-Palakkad Kozhikode Highway",
          return_state: "Kerala",
          return_country: "India",
          products_desc: order.orderItems
            .map((i: any) => `${i.name} (${i.variant || ""})`)
            .join(", "),
          hsn_code: "3303",
          cod_amount:
            order.paymentMethod === "COD" ? order.totalAmount.toString() : "0",
          order_date: new Date(order.createdAt).toISOString().split("T")[0],
          total_amount: order.totalAmount.toString(),
          seller_add:
            "Florenza Italiya Near ABS Traders Kodakkad, Opp: Rifa Medical Center Kodakkad-Palakkad Kozhikode Highway",
          seller_name: "Florenza Italiya",
          seller_inv: `INV${order._id.toString()}`,
          quantity: totalQuantity.toString(),
          shipment_width: "100",
          shipment_height: "150",
          shipment_length: "100",
          weight: weight.toString(),
          shipping_mode: "Surface",
          address_type: "home",
          seller_gst: process.env.GSTNO || "32AAIFO0471H1ZI",
        },
      ],
      pickup_location: {
        name: "Florenza Italiya",
        add: "Florenza Italiya Near ABS Traders Kodakkad, Opp: Rifa Medical Center Kodakkad-Palakkad Kozhikode Highway",
        pin: "678583",
        city: "Thachanattukara",
        state: "Kerala",
        country: "India",
        phone: "9778766273",
        gst: process.env.GSTNO || "32AAIFO0471H1ZI",
      },
    };

    // 5. Validate Delhivery token
    if (!DELHIVERY_API_TOKEN) {
      return NextResponse.json(
        { success: false, message: "Delhivery token not configured" },
        { status: 500 },
      );
    }

    // 6. Call Delhivery
    const delhiveryResponse = await createDelhiveryShipment(
      DELHIVERY_API_TOKEN,
      shipmentData,
    );

    // 7. Extract waybill
    const waybill = delhiveryResponse.packages?.[0]?.waybill;
    if (!waybill) {
      return NextResponse.json(
        { success: false, message: "No waybill returned" },
        { status: 500 },
      );
    }

    // 8. Save only waybill + status
    await Order.findByIdAndUpdate(orderId, {
      waybill,
      orderStatus: "Shipped",
    });

    return NextResponse.json({
      success: true,
      message: "Shipment created",
      waybill,
      orderId,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Server error" },
      { status: 500 },
    );
  }
}
