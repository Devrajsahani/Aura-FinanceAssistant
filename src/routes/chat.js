// src/routes/chat.js
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @route   POST /api/chat
 * @desc    Handle chatbot queries (FinGPT / RAG integration later)
 * @access  Private (JWT required)
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { query } = req.body;

    // Validate input
    if (!query) {
      console.error("[Chat] Missing query text");
      return res.status(400).json({ message: "Query text is required" });
    }

    // ----------------------------
    // 🤖 TODO: ML Integration
    // Here is where your ML teammate plugs in FinGPT/FinRobot API call.
    // Example:
    // const response = await axios.post("http://ml-service:5000/chat", { query });
    // return res.json({ answer: response.data.answer });
    // ----------------------------

    // Placeholder response (for now)
    res.json({
      answer: `This is a placeholder response for your query: "${query}"`,
    });
  } catch (err) {
    console.error("[Chat] Error:", err.message);
    res.status(500).json({ message: "Server error while processing chat" });
  }
});

export default router;
