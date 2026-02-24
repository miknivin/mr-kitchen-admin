// app/api/orders/[orderId]/delhivery/route.ts
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { isAuthenticatedUser } from "@/middlewares/auth";
import { authorizeRoles } from "@/middlewares/auth";
import dbConnect from "@/lib/db/connection";
import Order from "@/models/Order";
import { createDelhiveryShipment } from "@/utlis/createDelhiveryShipment";

const DELHIVERY_API_TOKEN = process.env.DELHIVERY_API_TOKEN;

export async function POST(
  request: Request,
  { params }: { params: { orderId: string } },
) {
  try {
    await dbConnect();

    const user = await isAuthenticatedUser(request);
    authorizeRoles(user, "admin");

    const { orderId } = params;
    if (!orderId || !mongoose.isValidObjectId(orderId)) {
      return NextResponse.json(
        { success: false, message: "Invalid order ID" },
        { status: 400 },
      );
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 },
      );
    }

    if (order.waybill) {
      return NextResponse.json(
        { success: false, message: "Order already has a waybill" },
        { status: 400 },
      );
    }

    // ---- Build shipment payload (unchanged) ----
    const totalQuantity = order.orderItems.reduce(
      (total: number, item: any) => total + item.quantity,
      0,
    );
    const weight = totalQuantity * 300; // 300 g per bottle

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
            .map((item: any) => item.name)
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
      },
    };
    // --------------------------------------------

    if (!DELHIVERY_API_TOKEN) {
      return NextResponse.json(
        { success: false, message: "Delhivery API token not configured" },
        { status: 500 },
      );
    }
    console.log("0");

    const delhiveryResponse = await createDelhiveryShipment(
      DELHIVERY_API_TOKEN,
      shipmentData,
    );
    console.log("1");
    // ---- NEW: Detailed failure handling ----
    // Delhivery returns `success: false` *or* individual packages with `status: "Fail"`
    const topLevelSuccess = delhiveryResponse.success === true;
    const packageFailures = (delhiveryResponse.packages ?? []).filter(
      (pkg: any) => pkg.status === "Fail",
    );

    if (!topLevelSuccess || packageFailures.length > 0) {
      console.log("2");

      // Gather remarks from packages first, then fallback to top-level `rmk`
      const remarks = packageFailures
        .flatMap((pkg: any) => pkg.remarks ?? [])
        .filter(Boolean);

      const message =
        remarks.length > 0
          ? remarks.join("; ")
          : (delhiveryResponse.rmk ?? "Unknown error from Delhivery");

      return NextResponse.json(
        {
          success: false,
          message: "Delhivery shipment creation failed",
          remarks, // <-- expose the exact remarks array
          delhiveryRaw: delhiveryResponse, // optional: full payload for debugging
        },
        { status: 502 },
      );
    }
    // ----------------------------------------

    const waybill = delhiveryResponse.packages?.[0]?.waybill;
    if (!waybill) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to retrieve waybill from Delhivery",
        },
        { status: 500 },
      );
    }

    await Order.findByIdAndUpdate(orderId, {
      waybill,
      orderStatus: "Shipped",
    });

    return NextResponse.json({
      success: true,
      message: "Delhivery order created successfully",
      waybill,
    });
  } catch (error: any) {
    console.error("Error creating Delhivery order:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create Delhivery order",
      },
      { status: 500 },
    );
  }
}
