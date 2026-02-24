// @/lib/shipRocket/createShiprocketOrder.js
import axios from "axios";
import { getShiprocketToken } from "@/lib/shipRocket/shipRocketToken.js";
import https from "https";

export async function createShiprocketOrder(orderData) {
  try {
    const token = await getShiprocketToken();
    //console.log(token, "token");

    const response = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
      orderData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        httpsAgent: new https.Agent({
          rejectUnauthorized: true, // Set to false only for debugging, not production
          secureProtocol: "TLSv1_2_method", // Force TLS 1.2
        }),
      }
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error creating Shiprocket order:", error);
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to create order";
    return {
      success: false,
      error: errorMessage,
      status: error.response?.status || 500,
    };
  }
}
