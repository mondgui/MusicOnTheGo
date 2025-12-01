import React, { useEffect, useState } from "react";
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
import { api } from "../../lib/api";

// -------- TYPES -------- //

type ScheduleItem = {
  id: number;
  student: string;
  instrument: string;
  time: string;
};

type BookingItem = {
  id: number;
  student: string;
  instrument: string;
  date: string;
  time: string;
  status: "Confirmed" | "Pending";
};

type AvailabilityDay = {
  day: string;
  slots: string[];
};

type TeacherTabKey = "schedule" | "messages" | "bookings" | "times" | "profile";

type TeacherTabConfig = {
  key: TeacherTabKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

// -------- SAMPLE DATA (STATIC FOR NOW) -------- //

const scheduleData: ScheduleItem[] = [
  { id: 1, student: "Emily Johnson", instrument: "Piano", time: "2:00 PM" },
  { id: 2, student: "Michael Chen", instrument: "Guitar", time: "4:00 PM" },
];

const bookingsData: BookingItem[] = [
  {
    id: 1,
    student: "Emily Johnson",
    instrument: "Piano",
    date: "Nov 15, 2025",
    time: "2:00 PM",
    status: "Confirmed",
  },
  {
    id: 2,
    student: "Michael Chen",
    instrument: "Guitar",
    date: "Nov 18, 2025",
    time: "4:00 PM",
    status: "Pending",
  },
];

const availabilityData: AvailabilityDay[] = [
  { day: "Monday", slots: ["2:00 PM - 3:00 PM", "4:00 PM - 5:00 PM"] },
  { day: "Wednesday", slots: ["1:00 PM - 2:00 PM", "3:00 PM - 4:00 PM"] },
  { day: "Friday", slots: ["2:00 PM - 3:00 PM", "5:00 PM - 6:00 PM"] },
];

// Bottom tabs for teacher
const TEACHER_TABS: TeacherTabConfig[] = [
  { key: "schedule", label: "Home", icon: "home-outline" },
  { key: "messages", label: "Messages", icon: "chatbubble-outline" },
  { key: "bookings", label: "Bookings", icon: "calendar-outline" },
  { key: "times", label: "Times", icon: "time-outline" },
  { key: "profile", label: "Profile", icon: "person-outline" },
];

// -------- MAIN COMPONENT -------- //

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState<TeacherTabKey>("schedule");
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const me = await api("/api/users/me", { auth: true });
        setUser(me);
      } catch (err) {
        console.error("Failed to load user", err);
      }
    };

    loadUser();
  }, []);

  return (
    <View style={styles.container}>
      {/* Scrollable content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Gradient Header (matching student style) */}
        <LinearGradient colors={["#FF9076", "#FF6A5C"]} style={styles.header}>
          {/* Top row: app name + notifications */}
          <View style={styles.headerTopRow}>
            <Text style={styles.appTitle}>MusicOnTheGo</Text>

            {/* Simple notifications icon (UI only for now) */}
            <TouchableOpacity style={styles.bellButton}>
              <Ionicons name="notifications-outline" size={22} color="white" />
              <View style={styles.bellDot} />
            </TouchableOpacity>
          </View>

          {/* Teacher info */}
          <View style={styles.profileRow}>
            <Image
              source={{ uri: "https://picsum.photos/300" }}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.teacherName}>{user?.name || "Your Name"}</Text>
              <Text style={styles.teacherInstrument}>
                {user?.instruments?.length
                  ? user.instruments.join(", ")
                  : "Instruments"}
              </Text>
              <Text style={styles.teacherRate}>
                {user?.rate ? `$${user.rate}/hour` : "$—/hour"}
              </Text>
            </View>
          </View>

          {/* Small subtitle */}
          <Text style={styles.headerSubtitle}>
            Manage your schedule, bookings, and availability.
          </Text>
        </LinearGradient>

        {/* Screen content depending on active tab */}
        <View style={styles.contentWrapper}>
          {activeTab === "schedule" && <ScheduleTab />}
          {activeTab === "messages" && <MessagesTab />}
          {activeTab === "bookings" && <BookingsTab />}
          {activeTab === "times" && <TimesTab />}
          {activeTab === "profile" && <TeacherProfileTab />}
        </View>
      </ScrollView>

      {/* Bottom Gradient Tab Bar (same style as student) */}
      <TeacherBottomTabBar activeTab={activeTab} setActiveTab={setActiveTab} />
    </View>
  );
}

// -------- TABS IMPLEMENTATION -------- //

function ScheduleTab() {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Today&apos;s Schedule</Text>

      {scheduleData.map((item) => (
        <View key={item.id} style={styles.lessonCardRow}>
          <View style={styles.lessonIconCircle}>
            <Ionicons name="time-outline" size={22} color="#FF6A5C" />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{item.student}</Text>
            <Text style={styles.cardSubtitle}>
              {item.instrument} • {item.time}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function MessagesTab() {
  const messages = [
    {
      id: 1,
      student: "Emily Johnson",
      instrument: "Piano",
      preview: "Thanks for today’s lesson!",
      time: "2h ago",
      unread: true,
      photo: "https://picsum.photos/200",
    },
    {
      id: 2,
      student: "Michael Chen",
      instrument: "Guitar",
      preview: "Can we reschedule to Tuesday?",
      time: "Yesterday",
      unread: false,
      photo: "https://picsum.photos/210",
    },
  ];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Messages</Text>

      {messages.map((msg) => (
        <View key={msg.id} style={styles.messageCard}>
          <Image source={{ uri: msg.photo }} style={styles.messageAvatar} />

          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{msg.student}</Text>
            <Text style={styles.cardSubtitle}>{msg.instrument}</Text>
            <Text style={styles.messagePreview}>{msg.preview}</Text>
          </View>

          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.timeText}>{msg.time}</Text>
            {msg.unread && <View style={styles.unreadDot} />}
          </View>
        </View>
      ))}
    </View>
  );
}





function BookingsTab() {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>All Bookings</Text>

      {bookingsData.map((item) => (
        <View key={item.id} style={styles.bookingCard}>
          <View style={styles.bookingHeaderRow}>
            <View>
              <Text style={styles.cardTitle}>{item.student}</Text>
              <Text style={styles.cardSubtitle}>{item.instrument}</Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                item.status === "Confirmed"
                  ? styles.confirmed
                  : styles.pending,
              ]}
            >
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>

          <Text style={styles.cardDetail}>📅 {item.date}</Text>
          <Text style={styles.cardDetail}>⏰ {item.time}</Text>
        </View>
      ))}
    </View>
  );
}

function TimesTab() {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Your Availability</Text>

      {availabilityData.map((day) => (
        <View key={day.day} style={styles.availabilityCard}>
          <Text style={styles.dayTitle}>{day.day}</Text>

          {day.slots.map((slot, index) => (
            <View key={index} style={styles.slotRow}>
              <Ionicons name="time-outline" size={18} color="#FF6A5C" />
              <Text style={styles.slotText}>{slot}</Text>
            </View>
          ))}
        </View>
      ))}

      {/* Future: add "Add availability" button here */}
    </View>
  );
}

function TeacherProfileTab() {
  return (
    <View style={styles.section}>
      <View style={{ alignItems: "center", marginBottom: 20 }}>
        <Image
          source={{ uri: "https://picsum.photos/250" }}
          style={styles.profileAvatar}
        />
        <Text style={styles.profileName}>Guimond Pierre Louis</Text>
        <Text style={styles.profileEmail}>teacher@email.com</Text>
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

// -------- BOTTOM TAB BAR (mirrors student style) -------- //

type TeacherBottomTabBarProps = {
  activeTab: TeacherTabKey;
  setActiveTab: (tab: TeacherTabKey) => void;
};

function TeacherBottomTabBar({
  activeTab,
  setActiveTab,
}: TeacherBottomTabBarProps) {
  return (
    <View style={styles.tabBar}>
      {TEACHER_TABS.map((tab) => {
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

// -------- STYLES (aligned with student dashboard) -------- //

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
  },

  appTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "700",
  },

  bellButton: {
    padding: 6,
  },

  bellDot: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#34D399", // green dot as "new"
  },

  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },

  teacherName: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
  },

  teacherInstrument: {
    color: "white",
    opacity: 0.9,
    marginTop: 2,
  },

  teacherRate: {
    color: "white",
    opacity: 0.9,
    marginTop: 2,
  },

  headerSubtitle: {
    color: "white",
    opacity: 0.9,
    marginTop: 14,
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

  // Schedule cards
  lessonCardRow: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 15,
    marginBottom: 12,
    alignItems: "center",
    gap: 12,
  },

  lessonIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFE0D6",
    justifyContent: "center",
    alignItems: "center",
  },

  // Booking cards
  bookingCard: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: 15,
    marginBottom: 12,
  },

  bookingHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
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
    marginTop: 4,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
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

  // Availability
  availabilityCard: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 15,
    marginBottom: 12,
  },

  dayTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 8,
  },

  slotRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },

  slotText: {
    fontSize: 15,
    color: "#555",
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

  // Bottom tab bar (same structure as student)
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

  tabPillActive: {
    // reserved for extra styling if needed
  },

  tabLabel: {
    fontSize: 11,
    color: "#888",
  },

  tabLabelActive: {
    color: "#FF6A5C",
    fontWeight: "700",
  },

  // ---- Messages ----
messageCard: {
  flexDirection: "row",
  backgroundColor: "white",
  padding: 15,
  borderRadius: 15,
  marginBottom: 12,
  gap: 12,
  alignItems: "center",
},

messageAvatar: {
  width: 50,
  height: 50,
  borderRadius: 25,
},

messagePreview: {
  color: "#777",
  marginTop: 4,
  fontSize: 14,
},

timeText: {
  color: "#999",
  fontSize: 12,
},

unreadDot: {
  width: 10,
  height: 10,
  borderRadius: 5,
  backgroundColor: "#FF6A5C",
  marginTop: 4,
}


});
