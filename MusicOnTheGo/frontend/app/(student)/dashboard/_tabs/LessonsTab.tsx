import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Avatar } from "../../../../components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../../components/ui/tabs";
import { api } from "../../../../lib/api";

type BookingData = {
  _id: string;
  teacher: {
    _id: string;
    name: string;
    email: string;
    location?: string;
    instruments?: string[];
  };
  day: string;
  timeSlot: {
    start: string;
    end: string;
  };
  status: "pending" | "approved" | "rejected";
};

type TransformedBooking = {
  id: string;
  name: string;
  instrument: string | null;
  date: string;
  originalDate?: string; // Preserve original date for comparison
  time: string;
  originalTimeSlot?: { start: string; end: string }; // Preserve original timeSlot for calendar
  location: string;
  status: "Confirmed" | "Pending" | "Completed";
  image?: string;
  email: string;
  phone?: string;
};

export default function LessonsTab() {
  const [bookings, setBookings] = useState<TransformedBooking[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper functions - defined before they're used
  // Convert day name to next occurrence date
  const dayNameToDate = (dayName: string): Date | null => {
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayIndex = dayNames.indexOf(dayName);
    if (dayIndex === -1) return null;
    
    const today = new Date();
    const currentDay = today.getDay();
    let daysUntil = dayIndex - currentDay;
    if (daysUntil <= 0) daysUntil += 7; // Next week if today or past
    
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysUntil);
    return nextDate;
  };

  const formatDate = (dateString: string): string => {
    try {
      // Check if it's a day name
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      if (dayNames.includes(dateString)) {
        // Convert day name to next occurrence date
        const date = dayNameToDate(dateString);
        if (date) {
          return date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          });
        }
        return dateString;
      }
      
      // Try to parse as date
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Convert 24-hour format to 12-hour format with AM/PM
  const formatTime24To12 = (time24: string): string => {
    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const formatTimeSlot = (timeSlot: { start: string; end: string }): string => {
    if (!timeSlot) return "";
    if (timeSlot.start && timeSlot.end) {
      const start = formatTime24To12(timeSlot.start);
      const end = formatTime24To12(timeSlot.end);
      return `${start} - ${end}`;
    }
    return timeSlot.start ? formatTime24To12(timeSlot.start) : "";
  };

  const transformBookings = (bookings: BookingData[]): TransformedBooking[] => {
    return bookings.map((booking) => {
      // Format date for display
      const displayDate = formatDate(booking.day);
      
      // Format time
      const time = formatTimeSlot(booking.timeSlot);
      
      // Map status
      const status =
        booking.status === "approved"
          ? "Confirmed"
          : booking.status === "pending"
          ? "Pending"
          : "Completed";
      
      // Get instrument from teacher - use first one if available
      const instrument = booking.teacher.instruments?.[0] || null;
      
      return {
        id: booking._id,
        name: booking.teacher.name,
        instrument: instrument,
        date: displayDate,
        originalDate: booking.day, // Preserve original for comparison
        time: time,
        originalTimeSlot: booking.timeSlot, // Preserve original timeSlot for calendar
        location: booking.teacher.location || "Location TBD",
        status: status,
        email: booking.teacher.email,
      };
    });
  };

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api("/api/bookings/student/me", { auth: true });
      const transformed = transformBookings(data);
      setBookings(transformed);
    } catch (err) {
      console.error("Failed to load bookings", err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  // Refresh bookings when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadBookings();
    }, [loadBookings])
  );

  const isUpcoming = (booking: TransformedBooking): boolean => {
    // Use originalDate if available, otherwise try to parse display date
    const dateString = booking.originalDate || booking.date;
    try {
      // Check if it's a day name
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      let bookingDate: Date;
      
      if (dayNames.includes(dateString)) {
        // Convert day name to next occurrence date
        const date = dayNameToDate(dateString);
        if (!date) return false;
        bookingDate = date;
      } else {
        // Try to parse as date string
        bookingDate = new Date(dateString);
        if (isNaN(bookingDate.getTime())) return false;
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      bookingDate.setHours(0, 0, 0, 0);
      
      // Upcoming if date is today or in the future, and status is not Completed
      return bookingDate >= today && booking.status !== "Completed";
    } catch {
      return false;
    }
  };

  // Helper function to parse booking date
  const parseBookingDate = (booking: TransformedBooking): Date | null => {
    const dateString = booking.originalDate || booking.date;
    try {
      // Check if it's a day name
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      if (dayNames.includes(dateString)) {
        const date = dayNameToDate(dateString);
        return date;
      }
      
      // Check if it's YYYY-MM-DD format
      const yyyyMmDdPattern = /^(\d{4})-(\d{2})-(\d{2})$/;
      if (yyyyMmDdPattern.test(dateString)) {
        // Parse as local date to avoid timezone issues
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day);
      }
      
      // Try to parse as date
      const parsed = new Date(dateString);
      return isNaN(parsed.getTime()) ? null : parsed;
    } catch {
      return null;
    }
  };

  // Helper function to categorize upcoming booking by time period
  const getUpcomingTimePeriod = (booking: TransformedBooking): string | null => {
    const bookingDate = parseBookingDate(booking);
    if (!bookingDate) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // End of this week (7 days from today, exclusive)
    const endOfThisWeek = new Date(today);
    endOfThisWeek.setDate(endOfThisWeek.getDate() + 7);
    
    // End of this month (first day of next month)
    const endOfThisMonth = new Date(today);
    endOfThisMonth.setMonth(endOfThisMonth.getMonth() + 1);
    endOfThisMonth.setDate(1);

    const bookingDateOnly = new Date(bookingDate);
    bookingDateOnly.setHours(0, 0, 0, 0);

    if (bookingDateOnly.getTime() === today.getTime()) {
      return "Today";
    } else if (bookingDateOnly.getTime() === tomorrow.getTime()) {
      return "Tomorrow";
    } else if (bookingDateOnly < endOfThisWeek) {
      return "This Week";
    } else if (bookingDateOnly < endOfThisMonth) {
      return "This Month";
    } else {
      const currentYear = today.getFullYear();
      const bookingYear = bookingDateOnly.getFullYear();
      
      if (bookingYear > currentYear) {
        return bookingYear.toString();
      } else {
        return bookingDateOnly.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      }
    }
  };

  // Helper function to categorize past booking by time period
  const getPastTimePeriod = (booking: TransformedBooking): string | null => {
    const bookingDate = parseBookingDate(booking);
    if (!bookingDate) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Start of this week (7 days ago)
    const startOfThisWeek = new Date(today);
    startOfThisWeek.setDate(startOfThisWeek.getDate() - 7);
    
    // Start of this month (first day of current month)
    const startOfThisMonth = new Date(today);
    startOfThisMonth.setDate(1);
    
    // Start of last month (first day of last month)
    const startOfLastMonth = new Date(today);
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);
    startOfLastMonth.setDate(1);
    
    // Start of this year (January 1st)
    const startOfThisYear = new Date(today);
    startOfThisYear.setMonth(0);
    startOfThisYear.setDate(1);

    const bookingDateOnly = new Date(bookingDate);
    bookingDateOnly.setHours(0, 0, 0, 0);

    if (bookingDateOnly >= startOfThisWeek) {
      return "This Week";
    } else if (bookingDateOnly >= startOfThisMonth) {
      return "This Month";
    } else if (bookingDateOnly >= startOfLastMonth) {
      return "Last Month";
    } else if (bookingDateOnly >= startOfThisYear) {
      return bookingDateOnly.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    } else {
      return bookingDateOnly.getFullYear().toString();
    }
  };

  const upcomingBookings = bookings.filter(isUpcoming);
  const pastBookings = bookings.filter((b) => !isUpcoming(b));

  // Separate pending bookings (show first in upcoming)
  const pendingUpcoming = upcomingBookings.filter(b => b.status === "Pending");
  const confirmedUpcoming = upcomingBookings.filter(b => b.status === "Confirmed");
  const confirmedPast = pastBookings.filter(b => b.status === "Confirmed");

  // Group confirmed upcoming bookings by time period
  const groupedUpcoming = confirmedUpcoming.reduce((groups, booking) => {
    const period = getUpcomingTimePeriod(booking);
    if (!period) return groups;
    if (!groups[period]) {
      groups[period] = [];
    }
    groups[period].push(booking);
    return groups;
  }, {} as Record<string, TransformedBooking[]>);

  // Group confirmed past bookings by time period
  const groupedPast = confirmedPast.reduce((groups, booking) => {
    const period = getPastTimePeriod(booking);
    if (!period) return groups;
    if (!groups[period]) {
      groups[period] = [];
    }
    groups[period].push(booking);
    return groups;
  }, {} as Record<string, TransformedBooking[]>);

  // Sort upcoming groups
  const upcomingGroupOrder = ["Today", "Tomorrow", "This Week", "This Month"];
  const sortedUpcomingKeys = Object.keys(groupedUpcoming).sort((a, b) => {
    const aIndex = upcomingGroupOrder.indexOf(a);
    const bIndex = upcomingGroupOrder.indexOf(b);
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    const dateA = parseBookingDate(groupedUpcoming[a][0]);
    const dateB = parseBookingDate(groupedUpcoming[b][0]);
    if (dateA && dateB) {
      return dateA.getTime() - dateB.getTime();
    }
    return a.localeCompare(b);
  });

  // Sort past groups (most recent first)
  const pastGroupOrder = ["This Week", "This Month", "Last Month"];
  const sortedPastKeys = Object.keys(groupedPast).sort((a, b) => {
    const aIndex = pastGroupOrder.indexOf(a);
    const bIndex = pastGroupOrder.indexOf(b);
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    const dateA = parseBookingDate(groupedPast[a][0]);
    const dateB = parseBookingDate(groupedPast[b][0]);
    if (dateA && dateB) {
      return dateB.getTime() - dateA.getTime(); // Reverse for past
    }
    return b.localeCompare(a); // Reverse alphabetical for past
  });

  // Sort bookings within each group
  sortedUpcomingKeys.forEach(key => {
    groupedUpcoming[key].sort((a, b) => {
      const dateA = parseBookingDate(a);
      const dateB = parseBookingDate(b);
      if (!dateA || !dateB) return 0;
      return dateA.getTime() - dateB.getTime(); // Ascending for upcoming
    });
  });

  sortedPastKeys.forEach(key => {
    groupedPast[key].sort((a, b) => {
      const dateA = parseBookingDate(a);
      const dateB = parseBookingDate(b);
      if (!dateA || !dateB) return 0;
      return dateB.getTime() - dateA.getTime(); // Descending for past
    });
  });

  const renderBooking = (booking: TransformedBooking) => (
    <Card key={booking.id} style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <Avatar
          src={booking.image}
          fallback={booking.name.charAt(0)}
          size={56}
        />
        <View style={styles.bookingInfo}>
          <View style={styles.bookingTitleRow}>
            <View style={styles.bookingTitleContainer}>
              <Text style={styles.bookingName}>{booking.name}</Text>
              {booking.instrument && (
                <Text style={styles.bookingInstrument}>{booking.instrument}</Text>
              )}
            </View>
            <Badge
              variant={
                booking.status === "Confirmed"
                  ? "success"
                  : booking.status === "Pending"
                  ? "warning"
                  : "secondary"
              }
            >
              {booking.status}
            </Badge>
          </View>
        </View>
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color="#FF6A5C" />
          <Text style={styles.detailText}>{booking.date}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color="#FF6A5C" />
          <Text style={styles.detailText}>{booking.time}</Text>
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>My Bookings</Text>
        <Text style={styles.sectionSubtitle}>Your scheduled lessons</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#FF6A5C" style={{ marginTop: 20 }} />
      ) : (
        <Tabs defaultValue="upcoming">
          <TabsList style={styles.tabsList}>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {upcomingBookings.length > 0 ? (
              <ScrollView style={styles.bookingsList} showsVerticalScrollIndicator={false}>
                {/* Pending Bookings Section */}
                {pendingUpcoming.length > 0 && (
                  <>
                    <Text style={styles.groupHeader}>Pending</Text>
                    {pendingUpcoming.map(renderBooking)}
                  </>
                )}

                {/* Confirmed Upcoming Bookings by Time Period */}
                {sortedUpcomingKeys.map((groupKey) => (
                  <View key={groupKey} style={styles.groupSection}>
                    <Text style={styles.groupHeader}>{groupKey}</Text>
                    {groupedUpcoming[groupKey].map(renderBooking)}
                  </View>
                ))}

                {pendingUpcoming.length === 0 && sortedUpcomingKeys.length === 0 && (
                  <Card style={styles.emptyCard}>
                    <Text style={styles.emptyText}>No upcoming bookings</Text>
                  </Card>
                )}
              </ScrollView>
            ) : (
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyText}>No upcoming bookings</Text>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="past">
            {pastBookings.length > 0 ? (
              <ScrollView style={styles.bookingsList} showsVerticalScrollIndicator={false}>
                {/* Confirmed Past Bookings by Time Period */}
                {sortedPastKeys.map((groupKey) => (
                  <View key={groupKey} style={styles.groupSection}>
                    <Text style={styles.groupHeader}>{groupKey}</Text>
                    {groupedPast[groupKey].map(renderBooking)}
                  </View>
                ))}

                {sortedPastKeys.length === 0 && (
                  <Card style={styles.emptyCard}>
                    <Text style={styles.emptyText}>No past bookings</Text>
                  </Card>
                )}
              </ScrollView>
            ) : (
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyText}>No past bookings</Text>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 30 },
  header: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FF6A5C",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  tabsList: {
    marginBottom: 16,
  },
  bookingsList: {
    marginTop: 8,
  },
  bookingCard: {
    marginBottom: 16,
    padding: 16,
  },
  bookingHeader: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  bookingInfo: {
    flex: 1,
  },
  bookingTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  bookingTitleContainer: {
    flex: 1,
  },
  bookingName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  bookingInstrument: {
    fontSize: 14,
    color: "#666",
  },
  bookingDetails: {
    backgroundColor: "#FFF5F3",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#555",
  },
  groupSection: {
    marginTop: 24,
    marginBottom: 8,
  },
  groupHeader: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
    marginTop: 8,
  },
  emptyCard: {
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
  },
});

