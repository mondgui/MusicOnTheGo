// app/(teacher)/dashboard/index.tsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { initSocket, getSocket } from "../../../lib/socket";
import type { Socket } from "socket.io-client";

import ScheduleBookingsTab, { type Booking } from "./_tabs/ScheduleBookingsTab";
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

type AvailabilityDay = { day: string; slots: string[] };

const availabilityData: AvailabilityDay[] = [
  { day: "Monday", slots: ["2:00 PM - 3:00 PM", "4:00 PM - 5:00 PM"] },
  { day: "Wednesday", slots: ["1:00 PM - 2:00 PM", "3:00 PM - 4:00 PM"] },
  { day: "Friday", slots: ["2:00 PM - 3:00 PM", "5:00 PM - 6:00 PM"] },
];

export default function TeacherDashboard() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const [innerTab, setInnerTab] = useState<string>("schedule-bookings");
  
  // Get the tab parameter from query string
  const getTabParam = (): string => {
    const tab = params.tab;
    if (Array.isArray(tab)) return tab[0] || "schedule-bookings";
    return tab || "schedule-bookings";
  };
  
  // Set active tab to "home" and inner tab based on param
  useEffect(() => {
    const tabParam = getTabParam();
    if (tabParam === "analytics" || tabParam === "profile") {
      setActiveTab("home");
      setInnerTab("analytics");
    } else if (tabParam === "schedule" || tabParam === "bookings") {
      setActiveTab("home");
      setInnerTab("schedule-bookings");
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

  // Load user with React Query
  const { data: user } = useQuery({
    queryKey: ["teacher-user"],
    queryFn: async () => {
      return await api("/api/users/me", { auth: true });
    },
  });

  const userId = user?._id || user?.id || null;

  // Header subtitle personalization for teachers
  const teacherInstrumentsArray = Array.isArray(user?.instruments)
    ? user.instruments.filter(Boolean)
    : [];

  let teacherInstrumentPhrase: string | null = null;
  if (teacherInstrumentsArray.length === 1) {
    teacherInstrumentPhrase = teacherInstrumentsArray[0];
  } else if (teacherInstrumentsArray.length >= 2) {
    // Show first two instruments
    teacherInstrumentPhrase = `${teacherInstrumentsArray[0]} & ${teacherInstrumentsArray[1]}`;
  }

  const headerSubtitle = teacherInstrumentPhrase
    ? `Discover new ${teacherInstrumentPhrase} students, manage your lesson calendar, and build your teaching career inside a thriving music community.`
    : "Discover new music students, manage your lesson calendar, and build your teaching career inside a thriving music community.";

  // Bookings query with infinite pagination
  const {
    data: bookingsData,
    fetchNextPage,
    hasNextPage,
    isFetching: bookingsLoading,
    isFetchingNextPage: bookingsLoadingMore,
    refetch: refetchBookings,
  } = useInfiniteQuery({
    queryKey: ["teacher-bookings", userId],
    queryFn: async ({ pageParam = 1 }) => {
      const params: Record<string, string> = {
        page: pageParam.toString(),
        limit: "20",
      };

      const response = await api("/api/bookings/teacher/me", {
        auth: true,
        params,
      });

      const data = response.bookings || response || [];
      const pagination = response.pagination;
      
      // Transform backend booking data to display format
      // Note: user is available from the useQuery hook above
      const currentUser = queryClient.getQueryData(["teacher-user"]) as any;
      const transformed: Booking[] = (Array.isArray(data) ? data : []).map((booking: any) => {
        // Convert backend status to frontend status
        let status: "Confirmed" | "Pending" | "Rejected" = "Pending";
        if (booking.status === "approved") {
          status = "Confirmed";
        } else if (booking.status === "pending") {
          status = "Pending";
        } else {
          status = "Rejected";
        }
        
        return {
          _id: booking._id,
          studentName: booking.student?.name || "Student",
          instrument: currentUser?.instruments?.[0] || "Music",
          date: formatDay(booking.day),
          time: formatTimeSlot(booking.timeSlot),
          status,
          originalDay: booking.day,
        };
      });
      
      // Sort bookings
      const sorted = transformed.sort((a: any, b: any) => {
        const statusPriority: { [key: string]: number } = {
          "Pending": 0,
          "Confirmed": 1,
          "Rejected": 2,
        };
        const statusDiff = statusPriority[a.status] - statusPriority[b.status];
        if (statusDiff !== 0) return statusDiff;
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });

      return {
        bookings: sorted,
        rawData: data, // Keep raw data for schedule
        pagination: pagination || { hasMore: sorted.length >= 20 },
        nextPage: pagination?.hasMore ? pageParam + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
    enabled: !!userId,
  });

  // Flatten all pages into a single array
  const bookings = useMemo(() => {
    return bookingsData?.pages.flatMap((page) => page.bookings) || [];
  }, [bookingsData]);

  const loadMoreBookings = () => {
    if (hasNextPage && !bookingsLoadingMore) {
      fetchNextPage();
    }
  };

  const hasMoreBookings = hasNextPage || false;

  // Initialize Socket.io for real-time booking updates
  useEffect(() => {
    let mounted = true;
    let socketInstance: Socket | null = null;

    async function setupSocket() {
      try {
        socketInstance = await initSocket();
        if (socketInstance && mounted && userId) {
          // Join teacher bookings room
          socketInstance.emit("join-teacher-bookings");

          // Listen for new booking requests
          socketInstance.on("new-booking-request", () => {
            if (mounted) {
              queryClient.invalidateQueries({ queryKey: ["teacher-bookings"] });
              refetchBookings();
            }
          });

          // Listen for booking updates
          socketInstance.on("booking-updated", () => {
            if (mounted) {
              queryClient.invalidateQueries({ queryKey: ["teacher-bookings"] });
              refetchBookings();
            }
          });
        }
      } catch (error) {
        console.warn("[Teacher Dashboard] Socket setup failed (non-critical):", error);
      }
    }

    if (userId) {
      setupSocket();
    }

    return () => {
      mounted = false;
      if (socketInstance) {
        socketInstance.emit("leave-teacher-bookings");
        socketInstance.off("new-booking-request");
        socketInstance.off("booking-updated");
      }
    };
  }, [userId, queryClient, refetchBookings]);

  // Refresh bookings when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (userId) {
        refetchBookings();
      }
    }, [userId, refetchBookings])
  );

  // Handle accept booking
  const handleAcceptBooking = useCallback(async (bookingId: string) => {
    try {
      await api(`/api/bookings/${bookingId}/status`, {
        method: "PUT",
        auth: true,
        body: JSON.stringify({ status: "approved" }),
      });
      // Invalidate and refetch bookings
      queryClient.invalidateQueries({ queryKey: ["teacher-bookings"] });
      refetchBookings();
    } catch (err: any) {
      console.error("Failed to accept booking", err);
      alert(err.message || "Failed to accept booking");
    }
  }, [queryClient, refetchBookings]);

  // Handle reject booking
  const handleRejectBooking = useCallback(async (bookingId: string) => {
    try {
      await api(`/api/bookings/${bookingId}/status`, {
        method: "PUT",
        auth: true,
        body: JSON.stringify({ status: "rejected" }),
      });
      // Invalidate and refetch bookings
      queryClient.invalidateQueries({ queryKey: ["teacher-bookings"] });
      refetchBookings();
    } catch (err: any) {
      console.error("Failed to reject booking", err);
      alert(err.message || "Failed to reject booking");
    }
  }, [queryClient, refetchBookings]);

  // Handle cancel/delete booking
  const handleCancelBooking = useCallback(async (bookingId: string) => {
    try {
      await api(`/api/bookings/${bookingId}`, {
        method: "DELETE",
        auth: true,
      });
      // Invalidate and refetch bookings
      queryClient.invalidateQueries({ queryKey: ["teacher-bookings"] });
      refetchBookings();
    } catch (err: any) {
      console.error("Failed to cancel booking", err);
      alert(err.message || "Failed to cancel booking");
    }
  }, [queryClient, refetchBookings]);

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
              onPress={() => setActiveTab("settings")}
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
            <Text style={styles.headerSubtitle}>
              {headerSubtitle}
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
              availabilityData={availabilityData}
              defaultTab={innerTab}
              bookings={bookings}
              bookingsLoading={bookingsLoading}
              bookingsLoadingMore={bookingsLoadingMore}
              hasMoreBookings={hasMoreBookings}
              onLoadMoreBookings={loadMoreBookings}
              onAccept={handleAcceptBooking}
              onReject={handleRejectBooking}
              onCancel={handleCancelBooking}
            />
          )}
          {activeTab === "bookings" && (
            <ScheduleBookingsTab
              bookings={bookings}
              loading={bookingsLoading}
              loadingMore={bookingsLoadingMore}
              hasMore={hasMoreBookings}
              onLoadMore={loadMoreBookings}
              onAccept={handleAcceptBooking}
              onReject={handleRejectBooking}
              onCancel={handleCancelBooking}
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
  availabilityData: AvailabilityDay[];
  defaultTab?: string;
  bookings: any[];
  bookingsLoading: boolean;
  bookingsLoadingMore?: boolean;
  hasMoreBookings?: boolean;
  onLoadMoreBookings?: () => void;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onCancel?: (id: string) => void;
};

function HomeTabContent({
  user,
  availabilityData,
  defaultTab = "schedule-bookings",
  bookings,
  bookingsLoading,
  bookingsLoadingMore = false,
  hasMoreBookings = false,
  onLoadMoreBookings,
  onAccept,
  onReject,
  onCancel,
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
          <Text style={styles.quickAccessText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>My Students</Text>
        </Card>
        <Card
          style={styles.quickAccessCard}
          onPress={() => {
            router.push("/(teacher)/resources");
          }}
        >
          <Ionicons name="book-outline" size={20} color="#FF9076" />
          <Text style={styles.quickAccessText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>Resources</Text>
        </Card>
        <Card
          style={styles.quickAccessCard}
          onPress={() => {
            router.push("/(teacher)/community");
          }}
        >
          <Ionicons name="people-circle-outline" size={20} color="#10B981" />
          <Text style={styles.quickAccessText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>Community</Text>
        </Card>
        <Card
          style={styles.quickAccessCard}
          onPress={() => {
            router.push("/(student)/practice-tools");
          }}
        >
          <Ionicons name="construct-outline" size={20} color="#4A90E2" />
          <Text style={styles.quickAccessText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>Tools</Text>
        </Card>
      </View>

      {/* Tabs Content */}
      <View style={styles.innerTabsWrapper}>
        <Tabs defaultValue={defaultTab} key={defaultTab}>
          <TabsList style={styles.tabsList}>
            <TabsTrigger value="schedule-bookings">Schedule</TabsTrigger>
            <TabsTrigger value="times">Times</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            {/* Bookings tab removed - merged into Schedule tab */}
          </TabsList>

          <TabsContent value="schedule-bookings">
            <ScheduleBookingsTab
              bookings={bookings}
              loading={bookingsLoading}
              loadingMore={bookingsLoadingMore}
              hasMore={hasMoreBookings}
              onLoadMore={onLoadMoreBookings}
              onAccept={onAccept}
              onReject={onReject}
              onCancel={onCancel}
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
  headerSubtitle: {
    color: "white",
    opacity: 0.9,
    fontSize: 12,
    marginTop: 6,
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
    minWidth: 0, // Allow flex shrinking
  },
  quickAccessText: {
    fontSize: 12,
    color: "#333",
    marginTop: 4,
    fontWeight: "500",
    textAlign: "center",
    width: "100%",
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