import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Avatar } from "../../../../components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../../components/ui/tabs";
import { Button } from "../../../../components/ui/button";
import { api } from "../../../../lib/api";
import { initSocket, getSocket } from "../../../../lib/socket";
import { useEffect } from "react";
import type { Socket } from "socket.io-client";

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
  const queryClient = useQueryClient();

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
      
      // Check if it's YYYY-MM-DD format (preferred format from backend)
      // Parse as local date to avoid timezone issues
      const yyyyMmDdPattern = /^(\d{4})-(\d{2})-(\d{2})$/;
      if (yyyyMmDdPattern.test(dateString)) {
        const [year, month, day] = dateString.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        });
      }
      
      // Try to parse as date string (fallback for other formats)
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

  // Bookings query with infinite pagination
  const {
    data: bookingsData,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["student-bookings"],
    queryFn: async ({ pageParam = 1 }) => {
      const params: Record<string, string> = {
        page: pageParam.toString(),
        limit: "20",
      };

      const response = await api("/api/bookings/student/me", {
        auth: true,
        params,
      });

      const bookingsData = response.bookings || response || [];
      const pagination = response.pagination;
      const transformed = transformBookings(Array.isArray(bookingsData) ? bookingsData : []);

      return {
        bookings: transformed,
        pagination: pagination || { hasMore: transformed.length >= 20 },
        nextPage: pagination?.hasMore ? pageParam + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });

  // Flatten all pages into a single array
  const bookings = useMemo(() => {
    return bookingsData?.pages.flatMap((page) => page.bookings) || [];
  }, [bookingsData]);

  const loadMoreBookings = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // Initialize Socket.io for real-time booking updates
  useEffect(() => {
    let mounted = true;
    let socketInstance: Socket | null = null;

    async function setupSocket() {
      try {
        socketInstance = await initSocket();
        if (socketInstance && mounted) {
          // Join student bookings room
          socketInstance.emit("join-student-bookings");

          // Listen for booking status changes
          socketInstance.on("booking-status-changed", () => {
            if (mounted) {
              console.log("[Student Lessons] Booking status changed");
              queryClient.invalidateQueries({ queryKey: ["student-bookings"] });
              refetch();
            }
          });

          // Listen for booking updates
          socketInstance.on("booking-updated", () => {
            if (mounted) {
              console.log("[Student Lessons] Booking updated");
              queryClient.invalidateQueries({ queryKey: ["student-bookings"] });
              refetch();
            }
          });
        }
      } catch (error) {
        console.warn("[Student Lessons] Socket setup failed (non-critical):", error);
      }
    }

    setupSocket();

    return () => {
      mounted = false;
      if (socketInstance) {
        socketInstance.emit("leave-student-bookings");
        socketInstance.off("booking-status-changed");
        socketInstance.off("booking-updated");
      }
    };
  }, [queryClient, refetch]);

  // Refresh bookings when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch])
  );

  const isUpcoming = (booking: TransformedBooking): boolean => {
    // Use the same parseBookingDate function to ensure consistency
    const bookingDate = parseBookingDate(booking);
    if (!bookingDate) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bookingDateOnly = new Date(bookingDate);
    bookingDateOnly.setHours(0, 0, 0, 0);
    
    // Compare dates as timestamps to avoid timezone issues
    const todayTime = today.getTime();
    const bookingTime = bookingDateOnly.getTime();
    
    // Upcoming if date is today or in the future, and status is not Completed
    // Use strict comparison: booking must be today or later
    const isUpcomingDate = bookingTime >= todayTime;
    
    if (__DEV__ && !isUpcomingDate && booking.status === "Confirmed") {
      console.log("[Student Lessons] ⚠️ Past booking detected:", {
        bookingId: booking.id,
        bookingDate: bookingDateOnly.toISOString().split('T')[0],
        today: today.toISOString().split('T')[0],
        bookingTime,
        todayTime,
        diff: todayTime - bookingTime,
      });
    }
    
    return isUpcomingDate && booking.status !== "Completed";
  };

  // Helper function to parse booking date
  const parseBookingDate = (booking: TransformedBooking): Date | null => {
    const dateString = booking.originalDate || booking.date;
    if (!dateString) return null;
    
    try {
      // Check if it's a day name
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      if (dayNames.includes(dateString)) {
        const date = dayNameToDate(dateString);
        return date;
      }
      
      // Check if it's YYYY-MM-DD format (preferred format from backend)
      const yyyyMmDdPattern = /^(\d{4})-(\d{2})-(\d{2})$/;
      if (yyyyMmDdPattern.test(dateString)) {
        // Parse as local date to avoid timezone issues
        const [year, month, day] = dateString.split('-').map(Number);
        const parsedDate = new Date(year, month - 1, day);
        
        // Validate the parsed date matches the input
        if (parsedDate.getFullYear() === year && 
            parsedDate.getMonth() === month - 1 && 
            parsedDate.getDate() === day) {
          return parsedDate;
        }
      }
      
      // Try to parse as date string (e.g., "Saturday, December 13, 2025")
      // This handles formatted display dates
      const parsed = new Date(dateString);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
      
      // Last resort: try to extract date from formatted string
      // Match patterns like "Saturday, December 13, 2025"
      const formattedPattern = /(\w+day),\s+(\w+)\s+(\d+),\s+(\d{4})/;
      const match = dateString.match(formattedPattern);
      if (match) {
        const monthNames = ["January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"];
        const monthName = match[2];
        const monthIndex = monthNames.indexOf(monthName);
        if (monthIndex !== -1) {
          const day = parseInt(match[3], 10);
          const year = parseInt(match[4], 10);
          return new Date(year, monthIndex, day);
        }
      }
      
      return null;
    } catch (error) {
      if (__DEV__) {
        console.error("[Student Lessons] Error parsing booking date:", dateString, error);
      }
      return null;
    }
  };

  // Helper function to categorize upcoming booking by time period
  const getUpcomingTimePeriod = (booking: TransformedBooking): string | null => {
    const bookingDate = parseBookingDate(booking);
    if (!bookingDate) {
      if (__DEV__) {
        console.log("[Student Lessons] ❌ Could not parse booking date:", {
          bookingId: booking.id,
          originalDate: booking.originalDate,
          displayDate: booking.date,
        });
      }
      return null;
    }

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

    // Use timestamp comparison for accurate date matching
    const bookingTime = bookingDateOnly.getTime();
    const todayTime = today.getTime();
    const tomorrowTime = tomorrow.getTime();
    
    const isToday = bookingTime === todayTime;
    const isTomorrow = bookingTime === tomorrowTime;

    if (__DEV__) {
      console.log("[Student Lessons] 🔍 Categorizing booking:", {
        bookingId: booking.id,
        originalDate: booking.originalDate,
        displayDate: booking.date,
        status: booking.status,
        bookingDateISO: bookingDateOnly.toISOString().split('T')[0],
        todayISO: today.toISOString().split('T')[0],
        tomorrowISO: tomorrow.toISOString().split('T')[0],
        bookingTime: bookingDateOnly.getTime(),
        todayTime: today.getTime(),
        tomorrowTime: tomorrow.getTime(),
        isToday,
        isTomorrow,
        bookingDateOnly: bookingDateOnly.toString(),
        today: today.toString(),
      });
    }

    // Safety check: Ensure booking is actually today (not in the past)
    // Calculate difference in days to catch any edge cases
    const daysDiff = Math.floor((bookingTime - todayTime) / (1000 * 60 * 60 * 24));
    
    if (isToday && daysDiff === 0) {
      if (__DEV__) {
        console.log("[Student Lessons] ✅ Returning 'Today's Schedule' for booking:", booking.id, {
          bookingDate: bookingDateOnly.toISOString().split('T')[0],
          today: today.toISOString().split('T')[0],
          daysDiff,
        });
      }
      return "Today's Schedule";
    } else if (isTomorrow && daysDiff === 1) {
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

  // Separate pending and confirmed bookings
  const pendingUpcoming = upcomingBookings.filter(b => b.status === "Pending");
  const confirmedUpcoming = upcomingBookings.filter(b => b.status === "Confirmed");
  const confirmedPast = pastBookings.filter(b => b.status === "Confirmed");

  // Group ALL upcoming bookings (both pending and confirmed) by time period
  // This ensures "Today" section appears for both pending and confirmed bookings
  const groupedUpcoming = upcomingBookings.reduce((groups, booking) => {
    const period = getUpcomingTimePeriod(booking);
    if (__DEV__) {
      console.log("[Student Lessons] Grouping booking:", {
        bookingId: booking.id,
        originalDate: booking.originalDate,
        status: booking.status,
        period,
      });
    }
    if (!period) return groups;
    if (!groups[period]) {
      groups[period] = [];
    }
    groups[period].push(booking);
    return groups;
  }, {} as Record<string, TransformedBooking[]>);

  if (__DEV__) {
    console.log("[Student Lessons] 📊 Grouping summary:", {
      totalUpcoming: upcomingBookings.length,
      pendingCount: pendingUpcoming.length,
      confirmedCount: confirmedUpcoming.length,
      groups: Object.keys(groupedUpcoming),
      todayCount: groupedUpcoming["Today"]?.length || 0,
      thisWeekCount: groupedUpcoming["This Week"]?.length || 0,
    });
  }

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
  const upcomingGroupOrder = ["Today's Schedule", "Tomorrow", "This Week", "This Month"];
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
    <Card style={styles.bookingCard}>
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

      {isFetching && bookings.length === 0 ? (
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
                {/* All Upcoming Bookings grouped by Time Period (includes both Pending and Confirmed) */}
                {sortedUpcomingKeys.map((groupKey) => {
                  const groupBookings = groupedUpcoming[groupKey];
                  if (!groupBookings || groupBookings.length === 0) return null;
                  
                  // Separate pending and confirmed within each group
                  const pendingInGroup = groupBookings.filter(b => b.status === "Pending");
                  const confirmedInGroup = groupBookings.filter(b => b.status === "Confirmed");
                  
                  return (
                    <View key={groupKey} style={styles.groupSection}>
                      <Text style={styles.groupHeader}>{groupKey}</Text>
                      {/* Show pending first, then confirmed */}
                      {pendingInGroup.map((booking) => (
                        <View key={`${groupKey}-pending-${booking.id}`}>
                          {renderBooking(booking)}
                        </View>
                      ))}
                      {confirmedInGroup.map((booking) => (
                        <View key={`${groupKey}-confirmed-${booking.id}`}>
                          {renderBooking(booking)}
                        </View>
                      ))}
                    </View>
                  );
                })}

                {sortedUpcomingKeys.length === 0 && (
                  <Card style={styles.emptyCard}>
                    <Text style={styles.emptyText}>No upcoming bookings</Text>
                  </Card>
                )}

                {/* Load More Button */}
                {hasNextPage && !isFetchingNextPage && (
                  <View style={styles.loadMoreContainer}>
                    <Button
                      variant="outline"
                      onPress={loadMoreBookings}
                      style={styles.loadMoreButton}
                    >
                      <Text style={styles.loadMoreText}>Load More Bookings</Text>
                    </Button>
                  </View>
                )}

                {/* Loading More Indicator */}
                {isFetchingNextPage && (
                  <View style={styles.loadingMoreContainer}>
                    <ActivityIndicator size="small" color="#FF6A5C" />
                    <Text style={styles.loadingMoreText}>Loading more bookings...</Text>
                  </View>
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
                    {groupedPast[groupKey].map((booking) => (
                      <View key={`${groupKey}-${booking.id}`}>
                        {renderBooking(booking)}
                      </View>
                    ))}
                  </View>
                ))}

                {sortedPastKeys.length === 0 && (
                  <Card style={styles.emptyCard}>
                    <Text style={styles.emptyText}>No past bookings</Text>
                  </Card>
                )}

                {/* Load More Button */}
                {hasNextPage && !isFetchingNextPage && (
                  <View style={styles.loadMoreContainer}>
                    <Button
                      variant="outline"
                      onPress={loadMoreBookings}
                      style={styles.loadMoreButton}
                    >
                      <Text style={styles.loadMoreText}>Load More Bookings</Text>
                    </Button>
                  </View>
                )}

                {/* Loading More Indicator */}
                {isFetchingNextPage && (
                  <View style={styles.loadingMoreContainer}>
                    <ActivityIndicator size="small" color="#FF6A5C" />
                    <Text style={styles.loadingMoreText}>Loading more bookings...</Text>
                  </View>
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
  loadMoreContainer: {
    padding: 20,
    alignItems: "center",
  },
  loadMoreButton: {
    minWidth: 200,
  },
  loadMoreText: {
    fontSize: 14,
    color: "#FF6A5C",
  },
  loadingMoreContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingMoreText: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
  },
});

