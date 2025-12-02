// app/(student)/dashboard.tsx

import React, { useState, useEffect } from "react";
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
import { useRouter, type Href } from "expo-router";
import { api } from "../../lib/api"; // <- if TS complains, adjust to "../lib/api"

// ---------- TYPES ---------- //

type Teacher = {
  _id: string;
  name: string;
  email: string;
  instruments: string[];
  experience: string;
  location: string;
};

type LessonCardData = {
  id: number;
  teacher: string;
  instrument: string;
  date: string;
  time: string;
  location: string;
  status: "Confirmed" | "Pending";
  photo: string;
};

type TabKey = "home" | "lessons" | "profile";

type TabConfig = {
  key: TabKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

// ---------- SAMPLE DATA (for My Lessons tab only) ---------- //

const lessonsData: LessonCardData[] = [
  {
    id: 1,
    teacher: "Sarah Mitchell",
    instrument: "Piano",
    date: "Nov 15, 2025",
    time: "2:00 PM",
    location: "San Francisco, CA",
    status: "Confirmed",
    photo: "https://picsum.photos/200",
  },
  {
    id: 2,
    teacher: "Michael Chen",
    instrument: "Guitar",
    date: "Nov 18, 2025",
    time: "4:00 PM",
    location: "Los Angeles, CA",
    status: "Pending",
    photo: "https://picsum.photos/220",
  },
];

// Bottom tabs config
const TABS: TabConfig[] = [
  { key: "home", label: "Home", icon: "home-outline" },
  { key: "lessons", label: "My Lessons", icon: "calendar-outline" },
  { key: "profile", label: "Profile", icon: "person-outline" },
];

// ---------- MAIN COMPONENT ---------- //

export default function StudentDashboard() {
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
          <Text style={styles.appTitle}>MusicOnTheGo</Text>
          <Text style={styles.welcomeText}>Welcome back, {user?.name || "student"} 🎧
          </Text>
          <Text style={styles.welcomeSub}>
           Continue your musical journey with your next lesson.
          </Text>
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

// ---------- HOME TAB (shows real teachers) ---------- //

type HomeTabProps = {
  teachers: Teacher[];
  loading: boolean;
};

function HomeTab({ teachers, loading }: HomeTabProps) {
  const router = useRouter();

  return (
    <View style={styles.section}>
      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick actions</Text>
      <View style={styles.quickActionsRow}>
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => router.push("/(student)/book-lesson" as Href)}
        >
          <LinearGradient
            colors={["#FF9076", "#FF6A5C"]}
            style={styles.quickActionGradient}
          >
            <Ionicons name="musical-notes-outline" size={26} color="white" />
          </LinearGradient>
          <Text style={styles.quickActionText}>Book a lesson</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => router.push("/(student)/my-lessons" as Href)}
        >
          <LinearGradient
            colors={["#FF9076", "#FF6A5C"]}
            style={styles.quickActionGradient}
          >
            <Ionicons name="calendar-outline" size={26} color="white" />
          </LinearGradient>
          <Text style={styles.quickActionText}>View schedule</Text>
        </TouchableOpacity>
      </View>

      {/* Recommended Teachers */}

      <Text style={[styles.sectionTitle, { marginTop: 25 }]}>
        Recommended for you
      </Text>



      {loading && (
        <Text style={{ color: "#777", marginBottom: 10 }}>Loading...</Text>
      )}



      {!loading && teachers.length === 0 && (
        <Text style={{ color: "#777" }}>
          No teachers available yet. Check back soon.
        </Text>
      )}



      {!loading &&
        teachers.map((teacher) => (
          <TouchableOpacity
            key={teacher._id}
            style={styles.teacherCard}
            onPress={() =>
              router.push(
                `/(student)/teacher/${teacher._id}` as Href
              )
            }
          >
            <Image
              source={{ uri: "https://picsum.photos/200" }}
              style={styles.teacherImage}
            />



            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{teacher.name}</Text>



              <Text style={styles.cardSubtitle}>
                {teacher.instruments?.length
                  ? teacher.instruments.join(", ")
                  : "No instruments listed"}
              </Text>



              <Text style={styles.cardDetail}>
                {teacher.location || "Location not specified"}
              </Text>



              <Text style={styles.priceText}>
                {teacher.experience || "Experience not listed"}
              </Text>
            </View>



            <Ionicons name="chevron-forward" size={24} color="#777" />
          </TouchableOpacity>
        ))}
    </View>
  );
}

// ---------- LESSONS TAB ---------- //

function LessonsTab() {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>My Lessons</Text>

      {lessonsData.map((lesson) => (
        <View key={lesson.id} style={styles.lessonCard}>
          <Image source={{ uri: lesson.photo }} style={styles.lessonImage} />

          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{lesson.teacher}</Text>
            <Text style={styles.cardSubtitle}>{lesson.instrument}</Text>
            <Text style={styles.cardDetail}>📅 {lesson.date}</Text>
            <Text style={styles.cardDetail}>⏰ {lesson.time}</Text>
            <Text style={styles.cardDetail}>📍 {lesson.location}</Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              lesson.status === "Confirmed"
                ? styles.confirmed
                : styles.pending,
            ]}
          >
            <Text style={styles.statusText}>{lesson.status}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

// ---------- PROFILE TAB ---------- //

function ProfileTab() {
  return (
    <View style={styles.section}>
      <View style={{ alignItems: "center", marginBottom: 20 }}>
        <Image
          source={{ uri: "https://picsum.photos/200" }}
          style={styles.profileAvatar}
        />
        <Text style={styles.profileName}>Your Name</Text>
        <Text style={styles.profileEmail}>student@email.com</Text>
      </View>

      <View style={styles.profileButton}>
        <Text style={styles.profileButtonText}>Edit Profile</Text>
      </View>

      <View style={styles.profileButton}>
        <Text style={styles.profileButtonText}>Log Out</Text>
      </View>
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

  appTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "700",
  },

  welcomeText: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 10,
  },

  welcomeSub: {
    color: "white",
    opacity: 0.9,
    marginTop: 5,
  },

  contentWrapper: {
    paddingHorizontal: 20,
    paddingTop: 25,
  },

  // Sections
  section: {
    marginBottom: 30,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 15,
  },

  // Quick actions
  quickActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  quickActionCard: {
    flex: 1,
    marginRight: 10,
    alignItems: "center",
  },

  quickActionGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },

  quickActionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },

  // Teacher cards
  teacherCard: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 15,
    marginBottom: 12,
    alignItems: "center",
    gap: 15,
  },

  teacherImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  ratingText: {
    marginLeft: 5,
    color: "#555",
  },

  priceText: {
    marginTop: 5,
    fontWeight: "600",
  },

  // Lessons
  lessonCard: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 15,
    marginBottom: 12,
    gap: 12,
  },

  lessonImage: {
    width: 55,
    height: 55,
    borderRadius: 10,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
  },

  cardSubtitle: {
    color: "#777",
    marginTop: 3,
  },

  cardDetail: {
    color: "#555",
    marginTop: 3,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignSelf: "flex-start",
  },

  confirmed: {
    backgroundColor: "#D6FFE1",
  },

  pending: {
    backgroundColor: "#FFF3C4",
  },

  statusText: {
    fontWeight: "600",
    color: "#333",
  },

  // Profile
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },

  profileName: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 10,
  },

  profileEmail: {
    color: "#666",
    marginTop: 5,
  },

  profileButton: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },

  profileButtonText: {
    textAlign: "center",
    fontWeight: "600",
    color: "#333",
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
