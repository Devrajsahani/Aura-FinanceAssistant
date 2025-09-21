import { io } from "socket.io-client";

console.log("🔄 Attempting connection to ws://127.0.0.1:4000 ...");

const socket = io("ws://127.0.0.1:4000", {
  transports: ["websocket"], // 🚀 force only websocket
  reconnectionAttempts: 3,
  timeout: 5000,
});

socket.on("connect", () => {
  console.log("✅ Connected with socket ID:", socket.id);
  socket.emit("join", "68cc7b64076f052e5d7ddb8d");
});

socket.on("connect_error", (err) => {
  console.error("❌ Connection error:", err.message);
});

socket.on("alert", (data) => {
  console.log("🚨 ALERT:", data);
});
