import React, { useEffect } from "react";
import { io } from "socket.io-client";

const SocketTest = () => {
  useEffect(() => {
    // Connect to backend
    const socket = io("http://localhost:4000", {
      transports: ["websocket"], // force WebSocket for now
    });

    socket.on("connect", () => {
      console.log("✅ Connected with socket ID:", socket.id);

      // Replace with real JWT userId when testing with backend
      socket.emit("join", "68cc7b64076f052e5d7ddb8d");
    });

    socket.on("alert", (data) => {
      console.log("🚨 ALERT received:", data);
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from server");
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Connection error:", err.message);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Socket.IO Test</h2>
      <p>Check your browser console (F12 → Console tab).</p>
    </div>
  );
};

export default SocketTest;
