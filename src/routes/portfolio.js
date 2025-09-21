import express from "express";
import Portfolio from "../models/Portfolio.js"; // make sure you created this model
import authMiddleware from "../middleware/authMiddleware.js";
import { emitAlert } from "../sockets/socketManager.js";
import { sendFCMNotification } from "../services/fcmSender.js";


const router = express.Router();

/**
 * @route   GET /api/portfolio
 * @desc    Get current portfolio for logged-in user
 * @access  Private (JWT required)
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ user: req.user.userId });

    if (!portfolio) {
      console.log(`[Portfolio][Fetch] No portfolio for user ${req.user.userId}`);
      return res.json({ message: "No portfolio found", holdings: [] });
    }

    console.log(`[Portfolio][Fetch] User ${req.user.username} portfolio fetched`);
    res.json(portfolio);
  } catch (err) {
    console.error("[Portfolio][Fetch] Error:", err.message);
    res.status(500).json({ message: "Server error while fetching portfolio" });
  }
});

/**
 * @route   POST /api/portfolio
 * @desc    Update portfolio (e.g., add new holding)
 * @access  Private (JWT required)
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { holdings } = req.body;

    if (!holdings || !Array.isArray(holdings)) {
      return res
        .status(400)
        .json({ message: "Holdings array is required in body" });
    }

    // Find existing portfolio or create new one
    let portfolio = await Portfolio.findOne({ user: req.user.userId });

    if (!portfolio) {
      portfolio = new Portfolio({
        user: req.user.userId,
        holdings,
      });
    } else {
      portfolio.holdings = holdings;
    }

    const savedPortfolio = await portfolio.save();
    console.log("[Portfolio][Update] ✅ Updated for user:", req.user.userId);

    // ----------------------------
    // 🔮 TODO ML: Call ML microservice to analyze portfolio
    // Example:
    // const insights = await axios.post("http://ml-service:5000/analyzePortfolio", { holdings });
    // if (insights.alerts?.length) {
    //   emitAlert(req.user.userId, {
    //     type: "portfolio_insight",
    //     message: "New portfolio insights available",
    //     insights: insights.alerts,
    //   });
    // }
    // ----------------------------

    // Emit socket event to notify user about portfolio update
    emitAlert(req.user.userId, {
      type: "portfolio_updated",
      message: "Your portfolio has been updated",
    });

    res.status(201).json(savedPortfolio);
  } catch (err) {
    console.error("[Portfolio][Update] Error:", err.message);
    res
      .status(500)
      .json({ message: "Server error while updating portfolio" });
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

export default router;