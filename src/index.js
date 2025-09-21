import express from "express";
import dotenv from "dotenv";
import http from "http"; // for attaching socket.io
import connectDB from "./db.js";
import authRoutes from "./routes/auth.js";
import transactionRoutes from "./routes/transactions.js";
import portfolioRoutes from "./routes/portfolio.js";
import { initSocket } from "./sockets/socketManager.js";
import testRoutes from "./routes/test.js";
import chatRoutes from "./routes/chat.js";
import marketRoutes from "./routes/market.js";
import mlRoutes from "./routes/ml.js";
import "./routes/client.js"; // auto-runs when server starts
import firebaseRoutes from "./routes/firebase.js";


dotenv.config();
console.log("🔑 NEWS_API_KEY:", process.env.NEWS_API_KEY);
console.log("🔑 ALPHA_VANTAGE_KEY:", process.env.ALPHA_VANTAGE_KEY);

await connectDB();

const app = express();
const server = http.createServer(app); // create HTTP server for socket.io
const PORT = process.env.PORT || 4000;

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/test-alert",testRoutes);
app.use("/api/chat",chatRoutes);
app.use("/api/market",marketRoutes);
app.use("/api/ml",mlRoutes);
app.use("/api/firebase",firebaseRoutes);

app.get("/", (req, res) => {
  res.send("AURA backend running ✅");
});

// Initialize Socket.IO
initSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 Server + Socket running at http://localhost:${PORT}`);
});

