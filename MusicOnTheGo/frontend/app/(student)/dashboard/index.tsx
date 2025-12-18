// app/(student)/dashboard/index.tsx

import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api";

import HomeTab from "./_tabs/HomeTab";
import LessonsTab from "./_tabs/LessonsTab";
import SettingsTab from "./_tabs/SettingsTab";

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
  specialties?: string[];
  profileImage?: string;
};

type TabKey = "home" | "lessons" | "settings";

type TabConfig = {
  key: TabKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

// Bottom tabs config
const TABS: TabConfig[] = [
  { key: "home", label: "Home", icon: "home-outline" },
  { key: "lessons", label: "My Lessons", icon: "calendar-outline" },
  { key: "settings", label: "Settings", icon: "settings-outline" },
];

// ---------- MAIN COMPONENT ---------- //

export default function StudentDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabKey>("home");

  // Load user with React Query
  const { data: user } = useQuery({
    queryKey: ["student-user"],
    queryFn: async () => {
      return await api("/api/users/me", { auth: true });
    },
  });

  // Teachers query with infinite pagination
  const {
    data: teachersData,
    fetchNextPage,
    hasNextPage,
    isFetching: loadingTeachers,
    isFetchingNextPage: loadingMoreTeachers,
    refetch: refetchTeachers,
  } = useInfiniteQuery({
    queryKey: ["teachers"],
    queryFn: async ({ pageParam = 1 }) => {
      const params: Record<string, string> = {
        page: pageParam.toString(),
        limit: "20",
      };

      const response = await api("/api/teachers", {
        method: "GET",
        params,
      });

      const teachersData = response.teachers || response || [];
      const pagination = response.pagination;

      return {
        teachers: Array.isArray(teachersData) ? teachersData : [],
        pagination: pagination || { hasMore: teachersData.length >= 20 },
        nextPage: pagination?.hasMore ? pageParam + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });

  // Flatten all pages into a single array
  const teachers = useMemo(() => {
    return teachersData?.pages.flatMap((page) => page.teachers) || [];
  }, [teachersData]);

  const hasMoreTeachers = hasNextPage || false;

  const loadMoreTeachers = () => {
    if (hasNextPage && !loadingMoreTeachers) {
      fetchNextPage();
    }
  };

  // Refresh user data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ["student-user"] });
    }, [queryClient])
  );

  // Header text personalization for students
  const studentName = user?.name || "Find Your Teacher";
  const instrumentsArray = Array.isArray(user?.instruments)
    ? user.instruments.filter(Boolean)
    : [];

  let instrumentPhrase: string | null = null;
  if (instrumentsArray.length === 1) {
    instrumentPhrase = instrumentsArray[0];
  } else if (instrumentsArray.length >= 2) {
    // Use the first two instruments for the header
    instrumentPhrase = `${instrumentsArray[0]} & ${instrumentsArray[1]}`;
  }

  const headerSubtitle = instrumentPhrase
    ? `Find inspiring ${instrumentPhrase} teachers, organize your lessons, and stay motivated with a supportive music community.`
    : "Find inspiring music teachers, organize your lessons, and stay motivated with a supportive music community.";

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
            {/* Profile Picture */}
            <TouchableOpacity
              style={styles.profilePictureContainer}
              onPress={() => router.push("/(student)/edit-profile")}
              activeOpacity={0.7}
            >
              {user?.profileImage ? (
                <Image
                  source={{ uri: user.profileImage }}
                  style={styles.profilePicture}
                />
              ) : (
                <View style={styles.profilePicturePlaceholder}>
                  <Ionicons name="person" size={24} color="white" />
                </View>
              )}
            </TouchableOpacity>

            {/* Text Content */}
            <View style={styles.headerTextContainer}>
              <Text style={styles.appTitle}>{studentName}</Text>
              <Text style={styles.welcomeSub}>{headerSubtitle}</Text>
            </View>

            {/* Messages Button */}
            <View style={styles.headerButtons}>
              <TouchableOpacity
                style={styles.headerIconButton}
                onPress={() => router.push("/messages")}
              >
                <Ionicons name="chatbubbles-outline" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Screen content depending on active tab */}
        <View style={styles.contentWrapper}>
            {activeTab === "home" && (
              <HomeTab
                teachers={teachers}
                loading={loadingTeachers}
                loadingMore={loadingMoreTeachers}
                hasMore={hasMoreTeachers}
                onLoadMore={loadMoreTeachers}
              />
            )}
          {activeTab === "lessons" && <LessonsTab />}
          {activeTab === "settings" && <SettingsTab />}
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
    alignItems: "center",
    gap: 12,
  },
  profilePictureContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  profilePicture: {
    width: "100%",
    height: "100%",
  },
  profilePicturePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
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

