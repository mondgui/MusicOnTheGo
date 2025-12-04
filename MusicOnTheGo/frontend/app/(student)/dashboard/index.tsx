// app/(student)/dashboard/index.tsx

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { api } from "../../../lib/api";

import HomeTab from "./_tabs/HomeTab";
import LessonsTab from "./_tabs/LessonsTab";
import ProfileTab from "./_tabs/ProfileTab";

// ---------- TYPES ---------- //

type Teacher = {
  _id: string;
  name: string;
  email: string;
  instruments: string[];
  experience: string;
  location: string;
  rate?: number;
  about?: string;
};

type TabKey = "home" | "lessons" | "profile";

type TabConfig = {
  key: TabKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

// Bottom tabs config
const TABS: TabConfig[] = [
  { key: "home", label: "Home", icon: "home-outline" },
  { key: "lessons", label: "My Lessons", icon: "calendar-outline" },
  { key: "profile", label: "Profile", icon: "person-outline" },
];

// ---------- MAIN COMPONENT ---------- //

export default function StudentDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("home");

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState<boolean>(false);
  const [user, setUser] = useState<any | null>(null);

  // Load teachers from backend
  useEffect(() => {
    async function loadTeachers() {
      try {
        setLoadingTeachers(true);
        const response = await api("/api/teachers");
        setTeachers(Array.isArray(response) ? response : []);
      } catch (err: any) {
        console.log("Error loading teachers:", err.message);
        setTeachers([]);
      } finally {
        setLoadingTeachers(false);
      }
    }

    async function loadUser() {
      try {
        const me = await api("/api/users/me", { auth: true });
        setUser(me);
      } catch (err) {
        console.log("Error loading user:", err);
      }
    }

    loadTeachers();
    loadUser();
  }, []);

  return (
    <View style={styles.container}>
      {/* Scrollable content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Gradient Header */}
        <LinearGradient colors={["#FF9076", "#FF6A5C"]} style={styles.header}>
          <View style={styles.headerTopRow}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.appTitle}>Find Your Teacher</Text>
              <Text style={styles.welcomeSub}>
                Discover expert music instructors near you
              </Text>
            </View>
            <View style={styles.headerButtons}>
              <TouchableOpacity
                style={styles.headerIconButton}
                onPress={() => router.push("/messages")}
              >
                <Ionicons name="chatbubbles-outline" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerIconButton}
                onPress={() => router.push("/(student)/settings")}
              >
                <Ionicons name="settings-outline" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Screen content depending on active tab */}
        <View style={styles.contentWrapper}>
          {activeTab === "home" && (
            <HomeTab teachers={teachers} loading={loadingTeachers} />
          )}
          {activeTab === "lessons" && <LessonsTab />}
          {activeTab === "profile" && <ProfileTab />}
        </View>
      </ScrollView>

      {/* Bottom Gradient Tab Bar */}
      <BottomTabBar activeTab={activeTab} setActiveTab={setActiveTab} />
    </View>
  );
}

// ---------- BOTTOM TAB BAR ---------- //

type BottomTabBarProps = {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
};

function BottomTabBar({ activeTab, setActiveTab }: BottomTabBarProps) {
  return (
    <View style={styles.tabBar}>
      {TABS.map((tab) => {
        const isActive = tab.key === activeTab;

        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabButton}
            onPress={() => setActiveTab(tab.key)}
          >
            <LinearGradient
              colors={
                isActive ? ["#FF9076", "#FF6A5C"] : ["#F4F4F4", "#F4F4F4"]
              }
              style={[styles.tabPill, isActive && styles.tabPillActive]}
            >
              <Ionicons
                name={tab.icon}
                size={22}
                color={isActive ? "white" : "#FF6A5C"}
              />
            </LinearGradient>
            <Text
              style={[styles.tabLabel, isActive && styles.tabLabelActive]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ---------- STYLES ---------- //

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF5F3",
  },

  header: {
    paddingTop: 70,
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerTextContainer: {
    flex: 1,
  },
  appTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  welcomeSub: {
    color: "white",
    opacity: 0.9,
    marginTop: 4,
    fontSize: 14,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 8,
  },
  headerIconButton: {
    padding: 8,
    borderRadius: 8,
  },

  contentWrapper: {
    paddingHorizontal: 20,
    paddingTop: 25,
  },

  // Bottom tab bar
  tabBar: {
    position: "absolute",
    bottom: 15,
    left: 20,
    right: 20,
    backgroundColor: "white",
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },

  tabButton: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },

  tabPill: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  tabPillActive: {},

  tabLabel: {
    fontSize: 11,
    color: "#888",
  },

  tabLabelActive: {
    color: "#FF6A5C",
    fontWeight: "700",
  },
});

