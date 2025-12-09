// frontend/lib/api.ts

// API Configuration
// For localhost (same device): "http://localhost:5050"
// For WiFi (different device): "http://YOUR_COMPUTER_IP:5050"
//   - Find your IP: Mac/Linux: `ifconfig` or `ipconfig` on Windows
//   - Example: "http://192.168.1.100:5050"
// To use environment variable, create a .env file with: EXPO_PUBLIC_API_URL=http://your-ip:5050
// command : ipconfig getifaddr en0

import { Platform } from "react-native";

// Prefer env override; otherwise pick a sensible default per platform.
// - iOS simulator can reach your Mac host via localhost
// - Android emulator needs 10.0.2.2 to reach the host machine
const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") ||
  (Platform.OS === "android"
    ? "http://10.0.2.2:5050"
    : "http://localhost:5050");

type ApiInit = RequestInit & {
  headers?: HeadersInit;
  auth?: boolean; // when true → automatically attach JWT token
};

// --------------------------------------------
// Normalize headers to Record<string, string>
// --------------------------------------------
function normalizeHeaders(h: ApiInit["headers"]): Record<string, string> {
  if (!h) return {};

  // Already an object
  if (typeof h === "object" && !Array.isArray(h)) {
    return h as Record<string, string>;
  }

  // Array of entries → convert to object
  if (Array.isArray(h)) {
    const out: Record<string, string> = {};
    h.forEach(([key, value]) => {
      out[key] = value;
    });
    return out;
  }

  return {};
}

// --------------------------------------------
// Load JWT token from storage (platform-aware)
// --------------------------------------------
import { storage } from "./storage";

async function getToken() {
  try {
    return await storage.getItem("token");
  } catch {
    return null;
  }
}

// --------------------------------------------
// Main API function
// --------------------------------------------
export async function api(path: string, init: ApiInit = {}) {
  const url = `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  // Normalize headers first
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...normalizeHeaders(init.headers),
  };

  // Attach JWT token if requested
  if (init.auth) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...init,
    headers,
  });

  const text = await response.text();
  let data: any = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const message =
      (data && (data.error || data.message)) ||
      `Request failed with ${response.status} ${response.statusText}`;
    throw new Error(message);
  }

  return data;
}
