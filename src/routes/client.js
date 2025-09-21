// src/services/wsClient.js
import WebSocket from "ws";
import { emitAlert } from "../sockets/socketManager.js";
import { sendFCMNotification } from "../services/fcmSender.js";

// A list of all the stocks to analyze
const stocksToAnalyze = [
  "TSLA", "AAPL", "MSFT", "GOOGL", "AMZN",
  "NVDA", "META", "JPM", "V", "JNJ",
  "WMT", "PG", "UNH", "HD", "DIS"
];

// The base URL for your ML WebSocket server
const baseUrl = "ws://10.1.185.177:9000/ws/stock_updates";

// 🔄 Function to connect and auto-reconnect for each stock
function connectStock(stockSymbol) {
  const ws_url = `${baseUrl}/${stockSymbol}`;
  const ws = new WebSocket(ws_url);

  ws.on("open", () => {
    console.log(`[${stockSymbol}] ✅ Connection successful.`);
  });

  ws.on("message", (event) => {
    try {
      const data = JSON.parse(event.toString());

      console.log(`\n--- [${stockSymbol}] Report Received ---`);
      console.log(data);
      console.log("---------------------------------");

      // Forward to all frontend clients
      emitAlert("global", {
        type: "ml_update",
        stock: stockSymbol,
        payload: data,
      });
    } catch (err) {
      console.error(`[${stockSymbol}] ❌ Error parsing message:`, err.message);
    }
  });

  ws.on("error", (error) => {
    console.error(`[${stockSymbol}] WebSocket Error:`, error.message);
  });

  ws.on("close", () => {
    console.log(`[${stockSymbol}] 🔌 Connection closed. Reconnecting in 5s...`);
    setTimeout(() => connectStock(stockSymbol), 5000);
  });
}

// // fire-and-forget FCM
// sendFCMNotification(req.user.userId, {
//   title: "New Transaction",
//   body: `₹${amount} ${type} — ${description || ""}`,
//   data: { txnId: savedTxn._id, type: "transaction_created" }
// }).catch((err) => {
//   // log but don't block route response
//   console.error("[sendFCMNotification] error:", err);
// });

// 🔄 Start connections for all stocks
console.log(`[INFO] Initializing WebSocket clients for ${stocksToAnalyze.length} stocks...`);
stocksToAnalyze.forEach((stock) => connectStock(stock));
