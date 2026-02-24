// @/lib/shiprocketToken.js
import axios from "axios";
import https from "https";
import dbConnect from "../db/connection";
import ShipRocketToken from "../../models/ShiprocketToken";

let cachedToken = null;
let cachedTokenExpiry = null;

async function loginToShiprocket() {
  const agent = new https.Agent({ secureProtocol: "TLSv1_2_method" });
  const response = await axios.post(
    "https:///apiv2.shiprocket.in/v1/external/auth/login",
    {
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    },
    {
      headers: { "Content-Type": "application/json" },
      httpsAgent: agent,
    },
  );
  if (!response.data.token) throw new Error("Failed to login to Shiprocket");
  return {
    token: response.data.token,
    expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days
  };
}

async function saveTokenToDB(token, expiresAt) {
  await dbConnect();
  await ShipRocketToken.deleteMany({});
  const newToken = new ShipRocketToken({ token, expiresAt });
  await newToken.save();
  return newToken;
}

async function getTokenFromDB() {
  await dbConnect();
  const tokenDoc = await ShipRocketToken.findOne().sort({ createdAt: -1 });
  if (tokenDoc && new Date() < tokenDoc.expiresAt) {
    return { token: tokenDoc.token, expiresAt: tokenDoc.expiresAt };
  }
  return null;
}

export async function getShiprocketToken() {
  const now = new Date();

  if (cachedToken && cachedTokenExpiry && now < cachedTokenExpiry) {
    return cachedToken;
  }

  const dbToken = await getTokenFromDB();
  if (dbToken) {
    cachedToken = dbToken.token;
    cachedTokenExpiry = dbToken.expiresAt;
    return cachedToken;
  }

  const { token, expiresAt } = await loginToShiprocket();
  await saveTokenToDB(token, expiresAt);
  cachedToken = token;
  cachedTokenExpiry = expiresAt;
  return token;
}
