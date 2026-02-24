import axios from "axios";


async function trackDelhiveryShipment( waybill: string, refIds = "ORD1243244") {
  // Call your backend API route instead of Delhivery directly
  try {
    const response = await axios.get("/api/delhivery-status", {
      params: {
        waybill,
        ref_ids: refIds,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(`Failed to track shipment: ${error.message}`);
  }
}

export { trackDelhiveryShipment };
