// src/models/DeviceToken.js
import mongoose from "mongoose";

const DeviceTokenSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  token: { type: String, required: true, index: true },
  platform: { type: String, enum: ["web", "android", "ios", "unknown"], default: "web" },
  lastSeenAt: { type: Date, default: Date.now },
  active: { type: Boolean, default: true },
}, { timestamps: true });

const DeviceToken = mongoose.model("DeviceToken", DeviceTokenSchema);
export default DeviceToken;
