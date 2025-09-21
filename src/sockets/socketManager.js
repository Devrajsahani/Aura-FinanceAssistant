// src/sockets/socketManager.js
import { Server } from "socket.io";

let io;
const userSocketMap = new Map(); // Map userId -> socketId

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", // TODO: Restrict to frontend URL in production
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`[Socket] 🔌 New connection: ${socket.id}`);

    // Handle user joining
    socket.on("join", (userId) => {
      userSocketMap.set(userId, socket.id);
      console.log(`[Socket] ✅ User ${userId} joined with socket ${socket.id}`);
    });

    // Handle chatbot queries
    socket.on("chat_query", async ({ userId, query }) => {
      console.log(`[Chat][Socket] User ${userId} asked: ${query}`);

      // ----------------------------
      // 🤖 TODO ML Integration:
      // Here your ML teammate plugs in FinGPT/FinRobot API.
      // Example:
      // const reply = await axios.post("http://ml-service:5000/chat", { query });
      // io.to(socket.id).emit("chat_reply", { answer: reply.data.answer });
      // ----------------------------

      // Dummy response for now
      io.to(socket.id).emit("chat_reply", {
        answer: `This is a placeholder chatbot reply for: "${query}"`,
      });
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      for (const [userId, id] of userSocketMap.entries()) {
        if (id === socket.id) {
          userSocketMap.delete(userId);
          console.log(`[Socket] ❌ User ${userId} disconnected`);
        }
      }
    });
  });

  console.log("[Socket] 🚀 Socket.IO initialized");
};
// emit alert
export const emitAlert = (userId, alertData) => {
  if (userId === "global") {
    console.log(`[Socket][Broadcast] Sending to ALL users`, alertData);
    io.emit("alert", alertData); // broadcast to all connected
    return;
  }

  const socketId = activeUsers.get(userId);
  if (socketId) {
    io.to(socketId).emit("alert", alertData);
    console.log(`[Socket] ✅ Alert sent to user ${userId}`, alertData);
  } else {
    console.log(`[Socket] ⚠️ No active socket for user ${userId}`);
  }
};

// Utility: get active sockets
export const getActiveSockets = () => {
  return Array.from(userSocketMap.entries());
};
