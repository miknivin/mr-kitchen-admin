import mongoose from "mongoose";

const ShipRocketTokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

const ShipRocketToken =
  mongoose.models.ShipRocketToken ||
  mongoose.model("ShipRocketToken", ShipRocketTokenSchema);

export default ShipRocketToken;
