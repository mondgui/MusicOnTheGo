// frontend/lib/socket.ts
// Socket.io client setup for real-time features

import { io, Socket } from "socket.io-client";
import { Platform } from "react-native";
import { storage } from "./storage";

// Get the same BASE_URL as api.ts
const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") ||
  (Platform.OS === "android"
    ? "http://10.0.2.2:5050"
    : "http://localhost:5050");

let socket: Socket | null = null;

// Track the token used for the current socket connection
let currentToken: string | null = null;

/**
 * Initialize Socket.io connection with authentication
 */
export async function initSocket(): Promise<Socket | null> {
  try {
    // Get token from storage
    const token = await storage.getItem("token");
    
    if (!token) {
      console.log("[Socket] No token found, skipping connection");
      // Disconnect existing socket if no token
      if (socket) {
        socket.disconnect();
        socket = null;
        currentToken = null;
      }
      return null;
    }

    // If socket exists and is connected with the same token, return it
    if (socket?.connected && currentToken === token) {
      console.log("[Socket] Using existing connection");
      return socket;
    }

    // If token changed or socket doesn't exist, create new connection
    if (currentToken !== token || !socket) {
      console.log("[Socket] Creating new connection (token changed or no socket)");
      
      // Disconnect existing socket if any
      if (socket) {
        socket.removeAllListeners(); // Remove all listeners
        socket.disconnect();
        socket = null;
      }

      // Create new socket connection
      socket = io(BASE_URL, {
        auth: {
          token: token,
        },
        transports: ["websocket", "polling"], // Fallback to polling if websocket fails
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        forceNew: true, // Force new connection
      });

      currentToken = token;

      socket.on("connect", () => {
        console.log("[Socket] ✅ Connected to server");
      });

      socket.on("disconnect", (reason) => {
        console.log("[Socket] ❌ Disconnected:", reason);
      });

      socket.on("connect_error", (error) => {
        console.error("[Socket] Connection error:", error.message);
      });

      socket.on("error", (error) => {
        console.error("[Socket] Error:", error);
      });
    }

    return socket;
  } catch (error) {
    console.error("[Socket] Failed to initialize:", error);
    return null;
  }
}

/**
 * Get the current socket instance
 */
export function getSocket(): Socket | null {
  return socket;
}

/**
 * Disconnect Socket.io connection
 */
export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners(); // Remove all listeners
    socket.disconnect();
    socket = null;
    currentToken = null;
    console.log("[Socket] Disconnected");
  }
}

/**
 * Reconnect Socket.io (useful after token refresh)
 */
export async function reconnectSocket() {
  disconnectSocket();
  return await initSocket();
}

