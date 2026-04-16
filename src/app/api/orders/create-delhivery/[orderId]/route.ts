// app/api/orders/[orderId]/delhivery/route.ts
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { isAuthenticatedUser } from "@/middlewares/auth";
import { authorizeRoles } from "@/middlewares/auth";
import dbConnect from "@/lib/db/connection";
import Order from "@/models/Order";
import { createDelhiveryShipment } from "@/utlis/createDelhiveryShipment";

export async function POST(
  request: Request,
  { params }: { params: { orderId: string } },
) {
  const DELHIVERY_API_TOKEN = process.env.DELHIVERY_API_TOKEN;
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
          add: `${order.shippingInfo.address}, ${order.shippingInfo.city}, Ph: ${order.shippingInfo.phoneNo}`,
          pin: order.shippingInfo.zipCode,
          city: order.shippingInfo.city,
          state: order.shippingInfo.state || "Unknown",
          country: order.shippingInfo.country || "India",
          phone: order.shippingInfo.phoneNo,
          order: order._id.toString(),
          payment_mode: order.paymentMethod === "COD" ? "COD" : "Prepaid",
          return_pin: "673573",
          return_city: "Thamarassery",
          return_phone: "7907154139",
          return_add:
            "Tp10/51 andona, parappanpoyil (PO), Thamarassery, kozhikod, Kerala",
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
            "Tp10/51 andona, parappanpoyil (PO), Thamarassery, kozhikod, Kerala",
          seller_name: process.env.DELHIVERY_WAREHOUSE_NAME || "Mr Kitchen",
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
        name: process.env.DELHIVERY_WAREHOUSE_NAME || "Mr Kitchen",
        add: "Tp10/51 andona, parappanpoyil (PO), Thamarassery, kozhikod, Kerala",
        pin: "673573",
        city: "Thamarassery",
        state: "Kerala",
        country: "India",
        phone: "7907154139",
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

      let responseError = delhiveryResponse.error;
      if (typeof responseError === 'boolean') {
          responseError = responseError ? "Delhivery API Error (true)" : "";
      } else if (typeof responseError === 'object') {
          responseError = JSON.stringify(responseError);
      }

      const message =
        remarks.length > 0
          ? remarks.join("; ")
          : (delhiveryResponse.rmk || responseError || "Unknown error from Delhivery");

      return NextResponse.json(
        {
          success: false,
          message: `Delhivery shipment creation failed: ${message}`,
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
