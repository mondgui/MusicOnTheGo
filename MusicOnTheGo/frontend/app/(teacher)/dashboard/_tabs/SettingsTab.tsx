import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { api } from "../../../../lib/api";
import { Card } from "../../../../components/ui/card";
import { Switch } from "../../../../components/ui/switch";
import { Separator } from "../../../../components/ui/separator";
import { clearAuth } from "../../../../lib/auth";
import { useQueryClient } from "@tanstack/react-query";

export default function SettingsTab() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);

  // Notification states
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Load user data
  useEffect(() => {
    async function loadUser() {
      try {
        await api("/api/users/me", { auth: true });
      } catch (err) {
        console.log("Error loading user:", err);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const handleLogout = async () => {
    try {
      // Clear all auth data
      await clearAuth();
      // Clear React Query cache to prevent data leakage
      queryClient.clear();
      // Navigate to login
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Still navigate to login even if clearing fails
      router.replace("/(auth)/login");
    }
  };

  if (loading) {
    return (
      <View style={styles.section}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.section}>
        {/* Account Settings */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.sectionContent}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push("/(teacher)/edit-profile")}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="person-outline" size={20} color="#FF6A5C" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Edit Profile</Text>
                  <Text style={styles.settingSubtitle}>
                    Update your personal information
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <Separator style={styles.separator} />

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="lock-closed-outline" size={20} color="#FF6A5C" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Change Password</Text>
                  <Text style={styles.settingSubtitle}>
                    Update your password
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <Separator style={styles.separator} />

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons
                  name="card-outline"
                  size={20}
                  color="#FF6A5C"
                />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Payment Settings</Text>
                  <Text style={styles.settingSubtitle}>
                    Manage payment methods
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Notifications */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.sectionContent}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="notifications-outline" size={20} color="#FF6A5C" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Push Notifications</Text>
                  <Text style={styles.settingSubtitle}>
                    Receive push notifications
                  </Text>
                </View>
              </View>
              <Switch
                value={pushNotifications}
                onValueChange={setPushNotifications}
              />
            </View>

            <Separator style={styles.separator} />

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="mail-outline" size={20} color="#FF6A5C" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Email Notifications</Text>
                  <Text style={styles.settingSubtitle}>
                    Lesson reminders & messages
                  </Text>
                </View>
              </View>
              <Switch
                value={emailNotifications}
                onValueChange={setEmailNotifications}
              />
            </View>
          </View>
        </Card>

        {/* Preferences */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.sectionContent}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="moon-outline" size={20} color="#FF6A5C" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Dark Mode</Text>
                  <Text style={styles.settingSubtitle}>Enable dark theme</Text>
                </View>
              </View>
              <Switch value={darkMode} onValueChange={setDarkMode} />
            </View>

            <Separator style={styles.separator} />

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="globe-outline" size={20} color="#FF6A5C" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Language</Text>
                  <Text style={styles.settingSubtitle}>English</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Privacy & Security */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Privacy & Security</Text>
          <View style={styles.sectionContent}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push("/(student)/privacy-policy")}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="shield-outline" size={20} color="#FF6A5C" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Privacy Policy</Text>
                  <Text style={styles.settingSubtitle}>
                    How we protect your data
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Support */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.sectionContent}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push("/(student)/help-center")}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="help-circle-outline" size={20} color="#FF6A5C" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Help Center</Text>
                  <Text style={styles.settingSubtitle}>
                    FAQs and support articles
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <Separator style={styles.separator} />

            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push("/(student)/contact-support")}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="mail-outline" size={20} color="#FF6A5C" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Contact Us</Text>
                  <Text style={styles.settingSubtitle}>
                    Get in touch with support
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          </View>
        </Card>

        {/* About */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.sectionContent}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push("/(student)/about")}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="information-circle-outline" size={20} color="#FF6A5C" />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>About MusicOnTheGo</Text>
                  <Text style={styles.settingSubtitle}>
                    Our mission and story
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.versionText}>MusicOnTheGo v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 30,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  sectionCard: {
    marginBottom: 20,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 16,
  },
  sectionContent: {
    gap: 0,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    color: "#666",
  },
  separator: {
    marginVertical: 4,
  },
  logoutButton: {
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "white",
  },
  logoutText: {
    color: "#EF4444",
    fontSize: 16,
    fontWeight: "600",
  },
  versionText: {
    textAlign: "center",
    color: "#999",
    fontSize: 12,
    marginTop: 10,
  },
});

