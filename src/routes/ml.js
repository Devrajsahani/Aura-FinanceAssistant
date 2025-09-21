import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/analyze-stock", async (req, res) => {
    console.log(`\n[REQUEST] Received request to /api/ml/analyze-stock`);

    try {
        const stockData = req.body;

        // --- CHANGE 1: The input from your client must now use "stock_symbol" ---
        if (!stockData || !stockData.stock_symbol) {
            console.warn('[WARN] Bad request. Missing "stock_symbol".');
            return res.status(400).json({ error: 'The request body must contain a "stock_symbol".' });
        }

        if (!process.env.ML_API_URL) {
            console.error("[ERROR] ML service URL is not configured in .env file.");
            return res.status(500).json({ error: "Server configuration error." });
        }

        // --- CHANGE 2: The target URL on your friend's server has changed ---
        // We now point to /analyze_stock as per your friend's new code.
        const targetUrl = `${process.env.ML_API_URL}/analyze_stock`;
        
        console.log(`[INFO] Forwarding request for ${stockData.stock_symbol} to ML service at ${targetUrl}`);

        // --- CHANGE 3: The payload is now a simple object, and the API key is removed ---
        // We are sending the exact body we received, as per your friend's example.
        const mlResponse = await axios.post(
            targetUrl,
            stockData, // Sending the plain object: { "stock_symbol": "AMZN" }
            {
                headers: {
                    "Content-Type": "application/json",
                    // The "X-API-Key" header is now removed to match your friend's code.
                }
            }
        );

        console.log(`[SUCCESS] Received analysis from ML model for ${stockData.stock_symbol}.`);
        console.log("--- ML Model Output ---");
        console.log(mlResponse.data); // This will now print the real prediction
        console.log("-----------------------");

        res.status(200).json(mlResponse.data);

    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("[ERROR] Axios error connecting to ML service:", error.response?.data || error.message);
        } else {
            console.error("[ERROR] Unexpected error in /analyze-stock:", error.message);
        }
        res.status(500).json({ error: "Could not process the analysis at this time." });
    }
});

export default router;

