// app/(teacher)/dashboard/index.tsx
import React, { useEffect, useState, useCallback } from "react";
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
import { useRouter, useFocusEffect, useLocalSearchParams } from "expo-router";
import { api } from "../../../lib/api";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import ScheduleTab from "./_tabs/ScheduleTab";
import BookingsTab from "./_tabs/BookingsTab";
import TimesTab from "./_tabs/TimesTab";
import AnalyticsTab from "./_tabs/AnalyticsTab";
import SettingsTab from "./_tabs/SettingsTab";

type TabKey = "home" | "bookings" | "settings";

type TabConfig = {
  key: TabKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

// Bottom tabs config
const TABS: TabConfig[] = [
  { key: "home", label: "Home", icon: "home-outline" },
  { key: "bookings", label: "Bookings", icon: "calendar-outline" },
  { key: "settings", label: "Settings", icon: "settings-outline" },
];

type ScheduleItem = { id: number; student: string; instrument: string; time: string };

type BookingItem = {
  id: number;
  student: string;
  instrument: string;
  date: string;
  time: string;
  status: "Confirmed" | "Pending";
};

type AvailabilityDay = { day: string; slots: string[] };

// scheduleData will be computed from bookings

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

export default function TeacherDashboard() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const [innerTab, setInnerTab] = useState<string>("schedule");
  const [user, setUser] = useState<any | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [scheduleData, setScheduleData] = useState<ScheduleItem[]>([]);
  
  // Get the tab parameter from query string
  const getTabParam = (): string => {
    const tab = params.tab;
    if (Array.isArray(tab)) return tab[0] || "schedule";
    return tab || "schedule";
  };
  
  // Set active tab to "home" and inner tab based on param
  useEffect(() => {
    const tabParam = getTabParam();
    if (tabParam === "analytics" || tabParam === "profile") {
      setActiveTab("home");
      setInnerTab("analytics");
    }
  }, [params.tab]);

  // Convert 24-hour format to 12-hour format with AM/PM (moved outside to prevent recreation)
  const formatTime24To12 = useCallback((time24: string): string => {
    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  }, []);

  // Format time slot for display
  const formatTimeSlot = useCallback((timeSlot: { start: string; end: string }): string => {
    const start = formatTime24To12(timeSlot.start);
    const end = formatTime24To12(timeSlot.end);
    return `${start} - ${end}`;
  }, [formatTime24To12]);

  // Format day for display (convert "Monday" to a date-like format or keep as is)
  const formatDay = useCallback((day: string): string => {
    // Check if it's a day name
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayIndex = dayNames.indexOf(day);
    
    if (dayIndex !== -1) {
      // Convert day name to next occurrence date
      const today = new Date();
      const currentDay = today.getDay();
      let daysUntil = dayIndex - currentDay;
      if (daysUntil <= 0) daysUntil += 7; // Next week if today or past
      
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + daysUntil);
      
      return nextDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }
    
    // Try to parse as date string (YYYY-MM-DD format)
    // Parse as local date to avoid timezone issues
    try {
      // Check if it's in YYYY-MM-DD format
      const yyyyMmDdPattern = /^(\d{4})-(\d{2})-(\d{2})$/;
      const match = day.match(yyyyMmDdPattern);
      
      if (match) {
        // Parse as local date (not UTC) to avoid timezone shift
        const year = parseInt(match[1], 10);
        const month = parseInt(match[2], 10) - 1; // Month is 0-indexed
        const dayOfMonth = parseInt(match[3], 10);
        const date = new Date(year, month, dayOfMonth);
        
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          });
        }
      } else {
        // Try parsing as general date string
        const date = new Date(day);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          });
        }
      }
    } catch {
      // If parsing fails, return as is
    }
    
    return day; // If not a day name or date, return as is
  }, []);

  // Load user data
  const loadUser = useCallback(async () => {
    try {
      const me = await api("/api/users/me", { auth: true });
      setUser(me);
      setUserId(me?._id || null);
    } catch (err) {
      console.error("Failed to load user", err);
    }
  }, []);

  // Load bookings from backend
  const loadBookings = useCallback(async () => {
    try {
      setBookingsLoading(true);
      const data = await api("/api/bookings/teacher/me", { auth: true });
      
      // Transform backend booking data to display format
      const transformed = (Array.isArray(data) ? data : []).map((booking: any) => ({
        _id: booking._id,
        studentName: booking.student?.name || "Student",
        instrument: user?.instruments?.[0] || "Music",
        date: formatDay(booking.day),
        time: formatTimeSlot(booking.timeSlot),
        status: booking.status === "approved" ? "Confirmed" : booking.status === "pending" ? "Pending" : "Rejected",
        createdAt: booking.createdAt || new Date().toISOString(), // Preserve creation timestamp for sorting
        originalDay: booking.day, // Preserve original day for date parsing
      }));
      
      // Sort bookings: Pending first (newest first), then Confirmed (newest first), then Rejected (newest first)
      const sorted = transformed.sort((a: any, b: any) => {
        // First, sort by status priority: Pending > Confirmed > Rejected
        const statusPriority: { [key: string]: number } = {
          "Pending": 0,
          "Confirmed": 1,
          "Rejected": 2,
        };
        
        const statusDiff = statusPriority[a.status] - statusPriority[b.status];
        if (statusDiff !== 0) {
          return statusDiff;
        }
        
        // If same status, sort by creation date (newest first)
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA; // Descending order (newest first)
      });
      
      setBookings(sorted);
      
      // Filter and transform bookings for today's schedule
      const today = new Date();
      const todayDayName = today.toLocaleDateString("en-US", { weekday: "long" });
      // Get today's date in YYYY-MM-DD format using local timezone (not UTC)
      const todayYear = today.getFullYear();
      const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
      const todayDay = String(today.getDate()).padStart(2, '0');
      const todayDateString = `${todayYear}-${todayMonth}-${todayDay}`;
      
      // Get today's approved bookings
      const todaySchedule: ScheduleItem[] = (Array.isArray(data) ? data : [])
        .filter((booking: any) => {
          if (booking.status !== "approved") return false;
          
          // Check if booking.day is a date string (YYYY-MM-DD format)
          const yyyyMmDdPattern = /^(\d{4})-(\d{2})-(\d{2})$/;
          if (yyyyMmDdPattern.test(booking.day)) {
            // Compare date strings directly
            return booking.day === todayDateString;
          } else {
            // Compare day names (for old recurring weekly bookings)
            return booking.day === todayDayName;
          }
        })
        .map((booking: any, index: number) => {
          const timeRange = formatTimeSlot(booking.timeSlot || {});
          const formattedDate = formatDay(booking.day);
          return {
            id: booking._id || index,
            student: booking.student?.name || "Student",
            instrument: user?.instruments?.[0] || "Music",
            time: timeRange,
            date: formattedDate,
          };
        })
        .sort((a: ScheduleItem, b: ScheduleItem) => {
          // Sort by time (convert to 24-hour for comparison)
          const parseTime = (timeStr: string): number => {
            const [time, period] = timeStr.split(" ");
            const [hours, minutes] = time.split(":");
            let hour = parseInt(hours);
            if (period === "PM" && hour !== 12) hour += 12;
            if (period === "AM" && hour === 12) hour = 0;
            return hour * 60 + parseInt(minutes || "0");
          };
          return parseTime(a.time) - parseTime(b.time);
        });
      
      setScheduleData(todaySchedule);
    } catch (err) {
      console.error("Failed to load bookings", err);
      setBookings([]);
      setScheduleData([]);
    } finally {
      setBookingsLoading(false);
    }
  }, [user, formatDay, formatTimeSlot]);

  // Load data on mount
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Load bookings after user is loaded
  useEffect(() => {
    if (userId) {
      loadBookings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]); // Only reload when user ID changes

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadUser();
      // Load bookings will be triggered by the useEffect above when user changes
    }, [loadUser])
  );

  // Handle accept booking
  const handleAcceptBooking = useCallback(async (bookingId: string) => {
    try {
      await api(`/api/bookings/${bookingId}/status`, {
        method: "PUT",
        auth: true,
        body: JSON.stringify({ status: "approved" }),
      });
      // Reload bookings to reflect the change
      loadBookings();
    } catch (err: any) {
      console.error("Failed to accept booking", err);
      alert(err.message || "Failed to accept booking");
    }
  }, [loadBookings]);

  // Handle reject booking
  const handleRejectBooking = useCallback(async (bookingId: string) => {
    try {
      await api(`/api/bookings/${bookingId}/status`, {
        method: "PUT",
        auth: true,
        body: JSON.stringify({ status: "rejected" }),
      });
      // Reload bookings to reflect the change
      loadBookings();
    } catch (err: any) {
      console.error("Failed to reject booking", err);
      alert(err.message || "Failed to reject booking");
    }
  }, [loadBookings]);

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
              onPress={() => router.push("/(teacher)/settings")}
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

            {/* Teacher Info */}
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTeacherName}>
                {user?.name || "Teacher Name"}
              </Text>
              <Text style={styles.headerTeacherInstrument}>
                {user?.instruments?.length
                  ? user.instruments.join(", ")
                  : "Piano, Guitar"}
              </Text>
              <Text style={styles.headerTeacherRate}>
                {user?.rate ? `$${user.rate}/hour` : "$45/hour"}
              </Text>
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
            <HomeTabContent
              user={user}
              scheduleData={scheduleData}
              bookingsData={bookingsData}
              availabilityData={availabilityData}
              defaultTab={innerTab}
              bookings={bookings}
              bookingsLoading={bookingsLoading}
              onAccept={handleAcceptBooking}
              onReject={handleRejectBooking}
            />
          )}
          {activeTab === "bookings" && (
            <BookingsTab
              bookings={bookings}
              loading={bookingsLoading}
              onAccept={handleAcceptBooking}
              onReject={handleRejectBooking}
            />
          )}
          {activeTab === "settings" && <SettingsTab />}
        </View>
      </ScrollView>

      {/* Bottom Gradient Tab Bar */}
      <BottomTabBar activeTab={activeTab} setActiveTab={setActiveTab} />
    </View>
  );
}

// Home Tab Content Component
type HomeTabContentProps = {
  user: any;
  scheduleData: ScheduleItem[];
  bookingsData: BookingItem[];
  availabilityData: AvailabilityDay[];
  defaultTab?: string;
  bookings: any[];
  bookingsLoading: boolean;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
};

function HomeTabContent({
  user,
  scheduleData,
  bookingsData,
  availabilityData,
  defaultTab = "schedule",
  bookings,
  bookingsLoading,
  onAccept,
  onReject,
}: HomeTabContentProps) {
  const router = useRouter();

  return (
    <View>
      {/* Quick Access Cards */}
      <View style={styles.quickAccessRow}>
        <Card
          style={styles.quickAccessCard}
          onPress={() => {
            router.push("/(teacher)/students");
          }}
        >
          <Ionicons name="people-outline" size={20} color="#FF6A5C" />
          <Text style={styles.quickAccessText}>Students</Text>
        </Card>
        <Card
          style={styles.quickAccessCard}
          onPress={() => {
            router.push("/(teacher)/resources");
          }}
        >
          <Ionicons name="book-outline" size={20} color="#FF9076" />
          <Text style={styles.quickAccessText}>Resources</Text>
        </Card>
        <Card
          style={styles.quickAccessCard}
          onPress={() => {
            router.push("/(teacher)/community");
          }}
        >
          <Ionicons name="people-circle-outline" size={20} color="#10B981" />
          <Text style={styles.quickAccessText}>Community</Text>
        </Card>
        <Card
          style={styles.quickAccessCard}
          onPress={() => {
            router.push("/(student)/practice-tools");
          }}
        >
          <Ionicons name="construct-outline" size={20} color="#4A90E2" />
          <Text style={styles.quickAccessText}>Tools</Text>
        </Card>
      </View>

      {/* Tabs Content */}
      <View style={styles.innerTabsWrapper}>
        <Tabs defaultValue={defaultTab} key={defaultTab}>
          <TabsList style={styles.tabsList}>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="times">Times</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="schedule">
            <ScheduleTab schedule={scheduleData} />
          </TabsContent>

          <TabsContent value="bookings">
            <BookingsTab
              bookings={bookings}
              loading={bookingsLoading}
              onAccept={onAccept}
              onReject={onReject}
            />
          </TabsContent>

          <TabsContent value="times">
            <TimesTab availability={availabilityData} />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsTab
              bookings={bookings}
              user={user}
            />
          </TabsContent>
        </Tabs>
      </View>
    </View>
  );
}

// Bottom Tab Bar Component
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
  headerTeacherName: {
    color: "white",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  headerTeacherInstrument: {
    color: "white",
    opacity: 0.9,
    fontSize: 14,
    marginBottom: 2,
  },
  headerTeacherRate: {
    color: "white",
    opacity: 0.9,
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
  teacherName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  teacherInstrument: {
    color: "#666",
    fontSize: 14,
    marginBottom: 2,
  },
  teacherRate: {
    color: "#666",
    fontSize: 14,
  },
  quickAccessRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  quickAccessCard: {
    flex: 1,
    padding: 12,
    alignItems: "center",
  },
  quickAccessText: {
    fontSize: 12,
    color: "#333",
    marginTop: 4,
    fontWeight: "500",
  },
  innerTabsWrapper: {
    marginTop: 8,
  },
  tabsList: {
    marginBottom: 16,
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