// // frontend/lib/auth.ts

// frontend/lib/auth.ts
import { storage } from "./storage";
import { disconnectSocket } from "./socket";

const TOKEN_KEY = "token";
const USER_KEY = "user";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "teacher" | "student";
};

// Save token + user after login / register
export async function saveAuth(token: string, user: AuthUser) {
  // Disconnect existing socket to force reconnection with new token
  disconnectSocket();
  await storage.setItem(TOKEN_KEY, token);
  await storage.setItem(USER_KEY, JSON.stringify(user));
}

// Read token (api.ts already uses storage directly, but this keeps it DRY)
export async function getTokenFromStorage() {
  return storage.getItem(TOKEN_KEY);
}

// Read current user (optional helper)
export async function getStoredUser(): Promise<AuthUser | null> {
  const raw = await storage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

// Clear everything on logout
export async function clearAuth() {
  // Disconnect socket on logout
  disconnectSocket();
  await storage.removeItem(TOKEN_KEY);
  await storage.removeItem(USER_KEY);
}



// import * as SecureStore from "expo-secure-store";

// const TOKEN_KEY = "token";
// const USER_KEY = "user";

// // -------------------------------
// // Save token + user after login
// // -------------------------------
// export async function saveAuth(token: string, user: any) {
//   try {
//     await SecureStore.setItemAsync(TOKEN_KEY, token);
//     await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
//   } catch (err) {
//     console.error("Error saving auth:", err);
//   }
// }

// // -------------------------------
// // Get stored JWT token
// // -------------------------------
// export async function getToken() {
//   try {
//     return await SecureStore.getItemAsync(TOKEN_KEY);
//   } catch {
//     return null;
//   }
// }

// // -------------------------------
// // Get stored user info (parsed)
// // -------------------------------
// export async function getUser() {
//   try {
//     const stored = await SecureStore.getItemAsync(USER_KEY);
//     return stored ? JSON.parse(stored) : null;
//   } catch {
//     return null;
//   }
// }

// // -------------------------------
// // Check login status
// // -------------------------------
// export async function isLoggedIn() {
//   const token = await getToken();
//   return !!token;
// }

// // -------------------------------
// // Get stored user role (student/teacher)
// // -------------------------------
// export async function getUserRole(): Promise<"student" | "teacher" | null> {
//   const user = await getUser();
//   return user?.role ?? null;
// }

// // -------------------------------
// // Logout – clear all auth data
// // -------------------------------
// export async function logout() {
//   try {
//     await SecureStore.deleteItemAsync(TOKEN_KEY);
//     await SecureStore.deleteItemAsync(USER_KEY);
//   } catch (err) {
//     console.error("Error clearing auth:", err);
//   }
// }
