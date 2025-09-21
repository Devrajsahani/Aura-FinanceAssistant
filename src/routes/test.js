import express from "express";
import { emitAlert } from "../sockets/socketManager.js";

const router = express.Router();

/**
 * @route   POST /api/test-alert
 * @desc    Send a dummy alert to a user
 * @access  Public (for now, test only)
 */
router.post("/", (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: "userId required" });

  const alert = {
    type: "test",
    message: "This is a test alert 🚨",
    timestamp: new Date(),
  };

  emitAlert(userId, alert);
  res.json({ message: `Alert sent to ${userId}`, alert });
});

export default router;
