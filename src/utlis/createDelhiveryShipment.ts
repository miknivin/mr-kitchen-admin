import axios from "axios";
import qs from "qs";

async function createDelhiveryShipment(token: any, shipmentData: any) {
  // Input validation
  if (!token || typeof token !== "string") {
    throw new Error("Invalid or missing Delhivery API token");
  }

  if (
    !shipmentData ||
    !shipmentData.shipments ||
    !Array.isArray(shipmentData.shipments) ||
    !shipmentData.pickup_location
  ) {
    throw new Error(
      "Invalid shipment data: shipments array and pickup_location are required",
    );
  }

  // Validate perfume-specific shipment data
  for (const shipment of shipmentData.shipments) {
    if (!shipment.hsn_code || shipment.hsn_code !== "3303") {
      console.warn(
        `Shipment HSN code should be "3303" for perfumes, found: ${shipment.hsn_code}`,
      );
    }
    if (
      !shipment.weight ||
      isNaN(parseFloat(shipment.weight)) ||
      parseFloat(shipment.weight) <= 0
    ) {
      throw new Error(`Invalid weight for shipment: ${shipment.order}`);
    }
    if (
      !shipment.shipment_width ||
      !shipment.shipment_height ||
      parseFloat(shipment.shipment_width) <= 0 ||
      parseFloat(shipment.shipment_height) <= 0
    ) {
      throw new Error(`Invalid dimensions for shipment: ${shipment.order}`);
    }
  }

  const options = {
    method: "POST",
    url: "https://track.delhivery.com/api/cmu/create.json",
    headers: {
      Authorization: `Token ${token}`,
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: qs.stringify({
      format: "json",
      data: JSON.stringify(shipmentData),
    }),
    timeout: 10000, // 10-second timeout
  };

  // Log request for debugging
  console.log(
    `Creating Delhivery shipment for order: ${shipmentData.shipments[0]?.order}`,
  );

  try {
    const response = await axios.request(options);
    const responseData = response.data;

    // Log success

    // Validate response
    if (!responseData.success) {
      console.log(JSON.stringify(responseData));

      throw new Error(
        responseData.error || "Delhivery API returned unsuccessful response",
      );
    }

    return responseData;
  } catch (error: any) {
    // Log error
    console.error(
      `Failed to create shipment for order ${shipmentData.shipments[0]?.order}: ${error.message}`,
    );

    // Handle specific Delhivery errors
    let errorMessage = error.message;
    if (error.response) {
      errorMessage =
        error.response.data?.error ||
        `Delhivery API error: ${error.response.status} - ${error.response.statusText}`;
    }

    throw new Error(errorMessage);
  }
}

export { createDelhiveryShipment };
