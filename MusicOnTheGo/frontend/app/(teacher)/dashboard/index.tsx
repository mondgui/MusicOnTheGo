// app/(teacher)/dashboard/index.tsx
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
import { api } from "../../../lib/api";

import ScheduleTab from "./_tabs/ScheduleTab";
import MessagesTab from "./_tabs/MessagesTab";
import BookingsTab from "./_tabs/BookingsTab";
import TimesTab from "./_tabs/TimesTab";
import TeacherProfileTab from "./_tabs/TeacherProfileTab";

type ScheduleItem = { id: number; student: string; instrument: string; time: string };

type BookingItem = {
  id: number | string;
  student: string;
  instrument: string;
  date: string;
  time: string;
  status: "Confirmed" | "Pending";
  _id?: string;
  studentName?: string;
};

type AvailabilityDay = { day: string; slots: string[] };

type TeacherTabKey = "schedule" | "messages" | "bookings" | "times" | "profile";

type TeacherTabConfig = {
  key: TeacherTabKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const scheduleData: ScheduleItem[] = [
  { id: 1, student: "Emily Johnson", instrument: "Piano", time: "2:00 PM" },
  { id: 2, student: "Michael Chen", instrument: "Guitar", time: "4:00 PM" },
];

const messagesData = [
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

const TEACHER_TABS: TeacherTabConfig[] = [
  { key: "schedule", label: "Home", icon: "home-outline" },
  { key: "messages", label: "Messages", icon: "chatbubble-outline" },
  { key: "bookings", label: "Bookings", icon: "calendar-outline" },
  { key: "times", label: "Times", icon: "time-outline" },
  { key: "profile", label: "Profile", icon: "person-outline" },
];

// Helper function to format time slot
function formatTimeSlot(start: string, end: string): string {
  // Convert 24h format (e.g., "14:00") to 12h format (e.g., "2:00 PM")
  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes || "00"} ${ampm}`;
  };
  return `${formatTime(start)} - ${formatTime(end)}`;
}

// Helper function to transform booking data
function transformBooking(booking: any): BookingItem {
  const studentName = booking.student?.name || "Student";
  // Parse the day field - it might be a date string or formatted date
  let dateStr = booking.day;
  if (booking.createdAt && !dateStr) {
    dateStr = new Date(booking.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } else if (dateStr && !dateStr.includes(",")) {
    // If day is just a date string, format it
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        dateStr = date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }
    } catch {
      // Keep original if parsing fails
    }
  }
  
  const time = booking.timeSlot?.start 
    ? formatTimeSlot(booking.timeSlot.start, booking.timeSlot.end)
    : "Time TBD";
  const status = booking.status === "approved" 
    ? "Confirmed" 
    : booking.status === "pending" 
    ? "Pending" 
    : "Pending";

  return {
    id: booking._id,
    student: studentName,
    instrument: "Instrument", // You may want to add instrument to booking model
    date: dateStr || "Date TBD",
    time,
    status: status as "Confirmed" | "Pending",
    _id: booking._id,
    studentName,
  };
}

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState<TeacherTabKey>("schedule");
  const [user, setUser] = useState<any | null>(null);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

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

  useEffect(() => {
    const loadBookings = async () => {
      try {
        setLoadingBookings(true);
        const data = await api("/api/bookings/teacher/me", { auth: true });
        
        // Transform backend booking format to frontend format
        const transformedBookings: BookingItem[] = data.map(transformBooking);

        setBookings(transformedBookings);
      } catch (err) {
        console.error("Failed to load bookings", err);
      } finally {
        setLoadingBookings(false);
      }
    };

    loadBookings();
  }, []);

  const handleAcceptBooking = async (bookingId: string) => {
    try {
      await api(`/api/bookings/${bookingId}/status`, {
        method: "PUT",
        auth: true,
        body: JSON.stringify({ status: "approved" }),
      });
      
      // Refresh bookings
      const data = await api("/api/bookings/teacher/me", { auth: true });
      const transformedBookings: BookingItem[] = data.map(transformBooking);

      setBookings(transformedBookings);
    } catch (err) {
      console.error("Failed to accept booking", err);
      alert("Failed to accept booking. Please try again.");
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    try {
      await api(`/api/bookings/${bookingId}/status`, {
        method: "PUT",
        auth: true,
        body: JSON.stringify({ status: "rejected" }),
      });
      
      // Remove rejected booking from list (or refresh)
      setBookings(bookings.filter((b) => b._id !== bookingId));
    } catch (err) {
      console.error("Failed to reject booking", err);
      alert("Failed to reject booking. Please try again.");
    }
  };

  // Get today's bookings for schedule tab
  const getTodaysBookings = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return bookings
      .filter((booking) => {
        // Check if booking date matches today
        try {
          const bookingDate = new Date(booking.date);
          bookingDate.setHours(0, 0, 0, 0);
          return (
            bookingDate.getTime() === today.getTime() &&
            booking.status === "Confirmed"
          );
        } catch {
          return false;
        }
      })
      .map((booking) => ({
        id: booking.id,
        student: booking.student,
        instrument: booking.instrument,
        time: booking.time.split(" - ")[0] || booking.time, // Just show start time
      }));
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <LinearGradient colors={["#FF9076", "#FF6A5C"]} style={styles.header}>
          <View style={styles.headerTopRow}>
            <Text style={styles.appTitle}>MusicOnTheGo</Text>
            <TouchableOpacity style={styles.bellButton}>
              <Ionicons name="notifications-outline" size={22} color="white" />
              <View style={styles.bellDot} />
            </TouchableOpacity>
          </View>

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

          <Text style={styles.headerSubtitle}>
            Manage your schedule, bookings, and availability.
          </Text>
        </LinearGradient>

        <View style={styles.contentWrapper}>
          {activeTab === "schedule" && (
            <ScheduleTab 
              schedule={getTodaysBookings()} 
              onBookingRequestsPress={() => setActiveTab("bookings")}
              onCreateAvailabilityPress={() => setActiveTab("times")}
            />
          )}
          {activeTab === "messages" && <MessagesTab messages={messagesData} />}
          {activeTab === "bookings" && (
            <BookingsTab
              bookings={bookings.map((item) => ({
                _id: item._id || item.id.toString(),
                studentName: item.studentName || item.student,
                instrument: item.instrument,
                date: item.date,
                time: item.time,
                status: item.status,
              }))}
              loading={loadingBookings}
              onAccept={handleAcceptBooking}
              onReject={handleRejectBooking}
            />
          )}
          {activeTab === "times" && <TimesTab availability={availabilityData} />}
          {activeTab === "profile" && (
            <TeacherProfileTab
              name={user?.name}
              email={user?.email}
              instruments={user?.instruments}
              rate={user?.rate}
            />
          )}
        </View>
      </ScrollView>

      <TeacherBottomTabBar activeTab={activeTab} setActiveTab={setActiveTab} />
    </View>
  );
}

type TeacherBottomTabBarProps = {
  activeTab: TeacherTabKey;
  setActiveTab: (tab: TeacherTabKey) => void;
};

function TeacherBottomTabBar({ activeTab, setActiveTab }: TeacherBottomTabBarProps) {
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
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF5F3" },

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

  appTitle: { color: "white", fontSize: 22, fontWeight: "700" },

  bellButton: { padding: 6 },

  bellDot: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#34D399",
  },

  profileRow: { flexDirection: "row", alignItems: "center", marginTop: 18 },

  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },

  teacherName: { fontSize: 20, fontWeight: "700", color: "white" },
  teacherInstrument: { color: "white", opacity: 0.9, marginTop: 2 },
  teacherRate: { color: "white", opacity: 0.9, marginTop: 2 },

  headerSubtitle: { color: "white", opacity: 0.9, marginTop: 14 },

  contentWrapper: { paddingHorizontal: 20, paddingTop: 25 },

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
  tabButton: { flex: 1, alignItems: "center", gap: 4 },
  tabPill: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  tabPillActive: {},
  tabLabel: { fontSize: 11, color: "#888" },
  tabLabelActive: { color: "#FF6A5C", fontWeight: "700" },
});
