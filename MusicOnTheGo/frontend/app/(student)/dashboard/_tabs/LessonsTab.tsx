import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Linking,
  TouchableOpacity,
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
  instrument: string;
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
      
      // Get instrument from teacher or use first one
      const instrument =
        booking.teacher.instruments?.[0] || "Instrument";
      
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

  const upcomingBookings = bookings.filter(isUpcoming);
  const pastBookings = bookings.filter((b) => !isUpcoming(b));

  const handleContact = (booking: TransformedBooking) => {
    // Navigate to messages - placeholder for now
    console.log("Contact:", booking);
    // TODO: Navigate to messages screen with teacher ID
  };

  const handleCall = (phone?: string) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    } else {
      alert("Phone number not available");
    }
  };

  const handleAddToCalendar = (booking: TransformedBooking) => {
    try {
      // Use original date and timeSlot from backend (24-hour format)
      const dateString = booking.originalDate || booking.date;
      const timeSlot = booking.originalTimeSlot;
      
      if (!timeSlot || !timeSlot.start) {
        alert("Time information not available");
        return;
      }
      
      // Parse the date
      const bookingDate = new Date(dateString);
      if (isNaN(bookingDate.getTime())) {
        alert("Invalid date format");
        return;
      }
      
      // Parse 24-hour time format (e.g., "14:00")
      const parseTime24 = (time24: string): { hours: number; minutes: number } => {
        const [hours, minutes] = time24.split(":").map(Number);
        return { hours, minutes };
      };
      
      const startTime = parseTime24(timeSlot.start);
      const endTime = timeSlot.end ? parseTime24(timeSlot.end) : {
        hours: startTime.hours + 1,
        minutes: startTime.minutes
      };
      
      // Set the date and time
      const startDateTime = new Date(bookingDate);
      startDateTime.setHours(startTime.hours, startTime.minutes, 0, 0);
      
      const endDateTime = new Date(bookingDate);
      endDateTime.setHours(endTime.hours, endTime.minutes, 0, 0);
      
      // Format dates for calendar URL (YYYYMMDDTHHmmss)
      const formatCalendarDate = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = String(date.getSeconds()).padStart(2, "0");
        return `${year}${month}${day}T${hours}${minutes}${seconds}`;
      };
      
      const start = formatCalendarDate(startDateTime);
      const end = formatCalendarDate(endDateTime);
      
      // Create calendar event title
      const title = encodeURIComponent(`Music Lesson with ${booking.name}`);
      const details = encodeURIComponent(
        `Lesson: ${booking.instrument}\nLocation: ${booking.location}`
      );
      const location = encodeURIComponent(booking.location);
      
      // Create Google Calendar URL (works on both iOS and Android)
      const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
      
      Linking.openURL(calendarUrl).catch((err) => {
        console.error("Failed to open calendar:", err);
        alert("Could not open calendar app");
      });
    } catch (error) {
      console.error("Error adding to calendar:", error);
      alert("Could not add event to calendar");
    }
  };

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
              <Text style={styles.bookingInstrument}>{booking.instrument}</Text>
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
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color="#FF6A5C" />
          <Text style={styles.detailText}>{booking.location}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      {booking.status === "Confirmed" && (
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.addToCalendarButton}
            onPress={() => handleAddToCalendar(booking)}
            activeOpacity={0.7}
          >
            <Ionicons name="calendar-outline" size={18} color="#FF6A5C" />
            <Text style={styles.addToCalendarText}>Add to Calendar</Text>
          </TouchableOpacity>
          
          <View style={styles.contactButtons}>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => handleContact(booking)}
              activeOpacity={0.7}
            >
              <Ionicons name="chatbubble-outline" size={16} color="#FF6A5C" />
              <Text style={styles.contactButtonText}>Contact</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.contactButton, styles.callButton]}
              onPress={() => handleCall(booking.phone)}
              activeOpacity={0.7}
            >
              <Ionicons name="call-outline" size={16} color="#FF9076" />
              <Text style={[styles.contactButtonText, styles.callButtonText]}>
                Call
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
                {upcomingBookings.map(renderBooking)}
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
                {pastBookings.map(renderBooking)}
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
  actionButtonsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    gap: 12,
  },
  addToCalendarButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#FF6A5C",
    borderRadius: 10,
  },
  addToCalendarText: {
    color: "#FF6A5C",
    fontSize: 14,
    fontWeight: "600",
  },
  contactButtons: {
    flexDirection: "row",
    gap: 8,
  },
  contactButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FF6A5C",
    backgroundColor: "transparent",
  },
  callButton: {
    borderColor: "#FF9076",
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF6A5C",
  },
  callButtonText: {
    color: "#FF9076",
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

