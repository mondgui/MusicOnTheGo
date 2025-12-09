// frontend/lib/storage.ts
// Platform-aware storage utility
// Uses SecureStore on native platforms, localStorage on web

import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

/**
 * Platform-aware storage utility
 * - Native (iOS/Android): Uses SecureStore
 * - Web: Uses localStorage
 */
export const storage = {
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },

  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
      return localStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  },

  async removeItem(key: string): Promise<void> {
    if (Platform.OS === "web") {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};

