// src/routes/transactions.js
import express from "express";
import Transaction from "../models/Transaction.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { emitAlert } from "../sockets/socketManager.js";
import { sendFCMNotification } from "../services/fcmSender.js";
// import { sendTransactionsForAnalysis } from "../services/mlClient.js"; // TODO: integrate ML later

const router = express.Router();

/**
 * @route   POST /api/transactions
 * @desc    Add a new transaction
 * @access  Private (JWT required)
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { amount, type, description, category, meta } = req.body;

    // Validate required fields
    if (!amount || !type) {
      console.error("[Transaction][Create] ❌ Missing amount or type");
      return res.status(400).json({ message: "Amount and type are required" });
    }

    // Create new transaction linked to the logged-in user
    const txn = new Transaction({
      user: req.user.userId, // comes from JWT
      amount,
      type,
      description,
      category,
      meta,
    });

    const savedTxn = await txn.save();
    console.log("[Transaction][Create] ✅ Saved:", savedTxn._id);

    // ----------------------------
    // 🔮 Placeholder for ML integration (anomaly detection, etc.)
    // Later we’ll call the ML service here and send alerts if needed
    // ----------------------------

    // ----------------------------
    // 🔔 Socket.IO alert (this is where socket gets called)
    // emitAlert looks up the socket by userId and calls:
    // io.to(userId).emit("alert", payload);
    // ----------------------------
    emitAlert(req.user.userId, {
      type: "transaction_created",
      message: "New transaction recorded",
      txnId: savedTxn._id,
    });

    res.status(201).json(savedTxn);
  } catch (err) {
    console.error("[Transaction][Create] 💥 Error:", err.message);
    res.status(500).json({ message: "Server error while creating transaction" });
  }
});

// // fire-and-forget FCM
// sendFCMNotification(req.user.userId, {
//   title: "New Transaction",
//   body: `₹${amount} ${type} — ${description || ""}`,
//   data: { txnId: savedTxn._id, type: "transaction_created" }
// }).catch((err) => {
//   // log but don't block route response
//   console.error("[sendFCMNotification] error:", err);
// });

/**
 * @route   GET /api/transactions
 * @desc    Get all transactions for the logged-in user
 * @access  Private (JWT required)
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const txns = await Transaction.find({ user: req.user.userId }).sort({ date: -1 });

    console.log(`[Transaction][Fetch] ✅ User ${req.user.username}, count: ${txns.length}`);

    res.json(txns);
  } catch (err) {
    console.error("[Transaction][Fetch] 💥 Error:", err.message);
    res.status(500).json({ message: "Server error while fetching transactions" });
  }
});

export default router;