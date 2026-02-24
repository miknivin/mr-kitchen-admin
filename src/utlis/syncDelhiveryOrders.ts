// utils/syncDelhiveryOrders.ts
import axios from "axios";
import dbConnect from "./../lib/db/connection";
import Order from "@/models/Order";

export async function syncDelhiveryOrders(waybill?: string) {
  await dbConnect();

  try {
    const query = waybill
      ? { waybill }
      : { waybill: { $exists: true, $ne: null } };
    const orders = await Order.find(query);

    let updatedCount = 0;
    let skippedCount = 0;

    const API_BASE_URL = process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/api/delhivery-status`
      : "http://localhost:3000/api/delhivery-status";

    for (const order of orders) {
      try {
        const response = await axios.get(API_BASE_URL, {
          params: {
            waybill: order.waybill,
            ref_ids: order._id,
          },
        });

        const shipmentData = response.data?.ShipmentData?.[0]?.Shipment;
        if (!shipmentData) {
          console.log(`No shipment data for order ${order._id}`);
          skippedCount++;
          continue;
        }

        const newOrderTracking =
          shipmentData.Scans?.map((scan: any) => ({
            Status: scan.ScanDetail.Scan,
            StatusDateTime: new Date(scan.ScanDetail.StatusDateTime),
            StatusType: scan.ScanDetail.ScanType,
            StatusLocation: scan.ScanDetail.ScannedLocation,
            Instructions: scan.ScanDetail.Instructions,
          })) || [];

        const newStatus = shipmentData.Status?.Status || order.orderStatus;

        const existingTrackingJson = JSON.stringify(
          order.orderTracking?.map((track: any) => ({
            Status: track.Status,
            StatusDateTime: track.StatusDateTime?.toISOString(),
            StatusType: track.StatusType,
            StatusLocation: track.StatusLocation,
            Instructions: track.Instructions,
          })) || [],
        );
        const newTrackingJson = JSON.stringify(
          newOrderTracking.map((track: any) => ({
            Status: track.Status,
            StatusDateTime: track.StatusDateTime?.toISOString(),
            StatusType: track.StatusType,
            StatusLocation: track.StatusLocation,
            Instructions: track.Instructions,
          })),
        );

        const hasStatusChanged =
          newStatus !== order.delhiveryCurrentOrderStatus;
        const hasTrackingChanged = existingTrackingJson !== newTrackingJson;
        const recentlyUpdated = order.updatedAt
          ? new Date().getTime() - new Date(order.updatedAt).getTime() < 3600000
          : false;

        if (!hasStatusChanged && !hasTrackingChanged && recentlyUpdated) {
          console.log(`No changes for order ${order._id}, skipping update`);
          skippedCount++;
          continue;
        }

        await Order.findByIdAndUpdate(order._id, {
          $set: {
            delhiveryCurrentOrderStatus: newStatus,
            orderTracking: newOrderTracking,
            ...(newStatus === "Delivered" && {
              orderStatus: "Delivered",
              deliveredAt: new Date(),
            }),
          },
        });

        updatedCount++;
        console.log(`Updated order ${order._id}`);
      } catch (error) {
        console.error(`Error syncing order ${order._id}:`, error);
      }
    }

    return {
      success: true,
      message: `Sync completed: ${updatedCount} orders updated, ${skippedCount} orders skipped`,
    };
  } catch (error) {
    console.error("Error in syncDelhiveryOrders:", error);
    return { success: false, message: "Failed to sync orders" };
  }
}
