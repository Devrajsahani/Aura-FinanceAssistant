// src/routes/market.js
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import axios from "axios";

const router = express.Router();

/**
 * @route   GET /api/market/news
 * @desc    Fetch latest financial news
 * @access  Private (JWT required)
 */
router.get("/news", authMiddleware, async (req, res) => {
  try {
    const apiKey = process.env.NEWS_API_KEY;

    if (!apiKey) {
      console.error("[Market][News] Missing NEWS_API_KEY in .env");
      return res.status(500).json({ message: "NEWS_API_KEY not configured" });
    }

    const { data } = await axios.get("https://newsapi.org/v2/everything", {
      params: {
        q: "finance",
        language: "en",
        sortBy: "publishedAt",
        pageSize: 5,
        apiKey,
      },
    });

    res.json(data.articles);
  } catch (err) {
    console.error("[Market][News] Error:", err.message);
    res.status(500).json({ message: "Failed to fetch news" });
  }
});

/**
 * @route   GET /api/market/quote/:symbol
 * @desc    Fetch stock price by symbol
 * @access  Private (JWT required)
 */
router.get("/quote/:symbol", authMiddleware, async (req, res) => {
  try {
    const apiKey = process.env.ALPHA_VANTAGE_KEY;
    const { symbol } = req.params;

    if (!apiKey) {
      console.error("[Market][Quote] Missing ALPHA_VANTAGE_KEY in .env");
      return res.status(500).json({ message: "ALPHA_VANTAGE_KEY not configured" });
    }

    const { data } = await axios.get("https://www.alphavantage.co/query", {
      params: {
        function: "GLOBAL_QUOTE",
        symbol,
        apikey: apiKey,
      },
    });

    if (!data["Global Quote"]) {
      return res.status(404).json({ message: "Symbol not found or API limit reached" });
    }

    res.json(data["Global Quote"]);
  } catch (err) {
    console.error("[Market][Quote] Error:", err.message);
    res.status(500).json({ message: "Failed to fetch stock quote" });
  }
});

export default router;
