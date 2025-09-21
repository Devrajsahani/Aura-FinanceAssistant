// src/routes/firebase.js
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import DeviceToken from "../models/DeviceToken.js";

const router = express.Router();

/**
 * POST /api/firebase/register-token
 * body: { token: "fcm-device-token", platform: "web" }
 * Protected: require JWT; req.user.userId available
 */
router.post("/register-token", authMiddleware, async (req, res) => {
  try {
    const { token, platform } = req.body;
    const userId = req.user.userId;

    if (!token) return res.status(400).json({ message: "token required" });

    // Upsert token for user
    const doc = await DeviceToken.findOneAndUpdate(
      { token },
      { user: userId, platform: platform || "web", lastSeenAt: new Date(), active: true },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.json({ success: true, token: doc.token });
  } catch (err) {
    console.error("[Firebase][register-token]", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
