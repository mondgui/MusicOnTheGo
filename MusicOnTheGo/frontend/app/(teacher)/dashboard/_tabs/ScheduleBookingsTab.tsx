import React from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export type Booking = {
  _id: string;
  studentName: string;
  instrument: string;
  date: string;
  time: string;
  status: "Confirmed" | "Pending" | "Rejected";
  originalDay?: string; // Original day string from backend (YYYY-MM-DD or day name)
};

type Props = {
  bookings: Booking[];
  loading?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onCancel?: (id: string) => void;
};

// Helper function to parse date from booking
const parseBookingDate = (booking: Booking): Date | null => {
  if (booking.originalDay) {
    // Check if it's a YYYY-MM-DD format
    const yyyyMmDdPattern = /^(\d{4})-(\d{2})-(\d{2})$/;
    if (yyyyMmDdPattern.test(booking.originalDay)) {
      // Parse as local date to avoid timezone issues
      const [year, month, day] = booking.originalDay.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
  }
  // Try to parse the formatted date string
  const parsed = new Date(booking.date);
  return isNaN(parsed.getTime()) ? null : parsed;
};

// Helper function to check if a booking is in the past
const isPastBooking = (booking: Booking): boolean => {
  const bookingDate = parseBookingDate(booking);
  if (!bookingDate) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const bookingDateOnly = new Date(bookingDate);
  bookingDateOnly.setHours(0, 0, 0, 0);
  
  return bookingDateOnly < today;
};

// Helper function to categorize upcoming booking by time period
const getUpcomingTimePeriod = (booking: Booking): string | null => {
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

  // End of this year (January 1st of next year)
  const endOfThisYear = new Date(today);
  endOfThisYear.setFullYear(endOfThisYear.getFullYear() + 1);
  endOfThisYear.setMonth(0);
  endOfThisYear.setDate(1);

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
  } else if (bookingDateOnly < endOfThisYear) {
    return "This Year";
  } else {
    // For dates beyond this year, return just the year
    return bookingDateOnly.getFullYear().toString();
  }
};

// Helper function to categorize past booking by time period
const getPastTimePeriod = (booking: Booking): string | null => {
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
    // Same year, but before last month - show month and year
    return bookingDateOnly.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  } else {
    // Different year - just show the year
    return bookingDateOnly.getFullYear().toString();
  }
};

// Component to render a booking card
const BookingCard = ({ 
  item, 
  onAccept, 
  onReject,
  onCancel
}: { 
  item: Booking; 
  onAccept?: (id: string) => void; 
  onReject?: (id: string) => void;
  onCancel?: (id: string) => void;
}) => {
  const handleCancel = () => {
    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this booking? The student will be notified.",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: () => onCancel?.(item._id),
        },
      ]
    );
  };

  // Check if this booking is in the past
  const isPast = isPastBooking(item);

  return (
    <Card style={styles.bookingCard}>
      <View style={styles.bookingHeaderRow}>
        <View style={styles.bookingInfo}>
          <Text style={styles.studentName}>{item.studentName || "Student"}</Text>
          <Text style={styles.instrument}>{item.instrument}</Text>
        </View>
        <View style={styles.statusRow}>
          <Badge
            variant={
              item.status === "Confirmed" 
                ? "success" 
                : item.status === "Rejected"
                ? "secondary"
                : "warning"
            }
          >
            {item.status}
          </Badge>
          {item.status === "Confirmed" && !isPast && (
            <TouchableOpacity
              style={styles.deleteIconButton}
              onPress={handleCancel}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="trash-outline" size={18} color="#FF6A5C" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.detailText} numberOfLines={1}>{item.date}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.detailText} numberOfLines={1} flexShrink={1}>{item.time}</Text>
        </View>
      </View>
      
      {item.status === "Pending" && (
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={() => onReject?.(item._id)}
          >
            <Text style={styles.rejectButtonText}>Reject</Text>
          </TouchableOpacity>
          <Button
            size="sm"
            onPress={() => onAccept?.(item._id)}
            style={styles.acceptButton}
          >
            Accept
          </Button>
        </View>
      )}
    </Card>
  );
};

export default function ScheduleBookingsTab({
  bookings,
  loading,
  loadingMore = false,
  hasMore = false,
  onLoadMore,
  onAccept,
  onReject,
  onCancel,
}: Props) {
  // Separate bookings into upcoming and past
  const upcomingBookings = bookings.filter(b => !isPastBooking(b));
  const pastBookings = bookings.filter(b => isPastBooking(b));

  // Separate pending bookings (always show first in upcoming)
  const pendingBookings = upcomingBookings.filter(b => b.status === "Pending");
  const confirmedUpcoming = upcomingBookings.filter(b => b.status === "Confirmed");
  const confirmedPast = pastBookings.filter(b => b.status === "Confirmed");
  const rejectedBookings = bookings.filter(b => b.status === "Rejected");

  // Group confirmed upcoming bookings by time period
  const groupedUpcoming = confirmedUpcoming.reduce((groups, booking) => {
    const period = getUpcomingTimePeriod(booking);
    if (!period) return groups;
    if (!groups[period]) {
      groups[period] = [];
    }
    groups[period].push(booking);
    return groups;
  }, {} as Record<string, Booking[]>);

  // Group confirmed past bookings by time period
  const groupedPast = confirmedPast.reduce((groups, booking) => {
    const period = getPastTimePeriod(booking);
    if (!period) return groups;
    if (!groups[period]) {
      groups[period] = [];
    }
    groups[period].push(booking);
    return groups;
  }, {} as Record<string, Booking[]>);

  // Sort upcoming groups in the order: Today, Tomorrow, This Week, This Month, This Year, then by date
  const upcomingGroupOrder = ["Today", "Tomorrow", "This Week", "This Month", "This Year"];
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
    // For past bookings, sort by date descending (most recent first)
    const dateA = parseBookingDate(groupedPast[a][0]);
    const dateB = parseBookingDate(groupedPast[b][0]);
    if (dateA && dateB) {
      return dateB.getTime() - dateA.getTime(); // Reverse order for past
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
      return dateB.getTime() - dateA.getTime(); // Descending for past (most recent first)
    });
  });

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Schedule & Bookings</Text>
        <Badge>{bookings.length} total</Badge>
      </View>

      {loading && bookings.length === 0 && (
        <ActivityIndicator color="#FF6A5C" style={{ marginBottom: 12 }} />
      )}

      {!loading && bookings.length === 0 && (
        <Text style={{ color: "#777" }}>No bookings yet.</Text>
      )}

      {!loading && bookings.length > 0 && (
        <Tabs defaultValue="upcoming">
          <TabsList style={styles.tabsList}>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {/* Pending Bookings Section */}
            {pendingBookings.length > 0 && (
              <>
                <Text style={styles.groupHeader}>Pending</Text>
                {pendingBookings.map((item) => (
                  <BookingCard
                    key={item._id}
                    item={item}
                    onAccept={onAccept}
                    onReject={onReject}
                    onCancel={onCancel}
                  />
                ))}
              </>
            )}

            {/* Confirmed Upcoming Bookings by Time Period */}
            {sortedUpcomingKeys.map((groupKey) => (
              <View key={groupKey} style={styles.groupSection}>
                <Text style={styles.groupHeader}>{groupKey}</Text>
                {groupedUpcoming[groupKey].map((item) => (
                  <BookingCard
                    key={item._id}
                    item={item}
                    onAccept={onAccept}
                    onReject={onReject}
                    onCancel={onCancel}
                  />
                ))}
              </View>
            ))}

            {pendingBookings.length === 0 && sortedUpcomingKeys.length === 0 && (
              <Text style={{ color: "#777", marginTop: 20 }}>No upcoming bookings.</Text>
            )}

            {/* Load More Button */}
            {hasMore && !loadingMore && onLoadMore && (
              <View style={styles.loadMoreContainer}>
                <Button variant="outline" onPress={onLoadMore} style={styles.loadMoreButton}>
                  <Text style={styles.loadMoreText}>Load More Bookings</Text>
                </Button>
              </View>
            )}

            {/* Loading More Indicator */}
            {loadingMore && (
              <View style={styles.loadingMoreContainer}>
                <ActivityIndicator size="small" color="#FF6A5C" />
                <Text style={styles.loadingMoreText}>Loading more bookings...</Text>
              </View>
            )}
          </TabsContent>

          <TabsContent value="past">
            {/* Confirmed Past Bookings by Time Period */}
            {sortedPastKeys.map((groupKey) => (
              <View key={groupKey} style={styles.groupSection}>
                <Text style={styles.groupHeader}>{groupKey}</Text>
                {groupedPast[groupKey].map((item) => (
                  <BookingCard
                    key={item._id}
                    item={item}
                    onAccept={onAccept}
                    onReject={onReject}
                    onCancel={onCancel}
                  />
                ))}
              </View>
            ))}

            {/* Rejected Bookings Section */}
            {rejectedBookings.length > 0 && (
              <>
                <Text style={styles.groupHeader}>Rejected</Text>
                {rejectedBookings.map((item) => (
                  <BookingCard
                    key={item._id}
                    item={item}
                    onAccept={onAccept}
                    onReject={onReject}
                    onCancel={onCancel}
                  />
                ))}
              </>
            )}

            {sortedPastKeys.length === 0 && rejectedBookings.length === 0 && (
              <Text style={{ color: "#777", marginTop: 20 }}>No past bookings.</Text>
            )}

            {/* Load More Button */}
            {hasMore && !loadingMore && onLoadMore && (
              <View style={styles.loadMoreContainer}>
                <Button variant="outline" onPress={onLoadMore} style={styles.loadMoreButton}>
                  <Text style={styles.loadMoreText}>Load More Bookings</Text>
                </Button>
              </View>
            )}

            {/* Loading More Indicator */}
            {loadingMore && (
              <View style={styles.loadingMoreContainer}>
                <ActivityIndicator size="small" color="#FF6A5C" />
                <Text style={styles.loadingMoreText}>Loading more bookings...</Text>
              </View>
            )}
          </TabsContent>
        </Tabs>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 16,
    gap: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  bookingCard: {
    padding: 16,
    marginBottom: 12,
  },
  bookingHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  bookingInfo: {
    flex: 1,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  deleteIconButton: {
    padding: 4,
  },
  studentName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  instrument: {
    fontSize: 14,
    color: "#666",
  },
  bookingDetails: {
    flexDirection: "column",
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    minWidth: 0,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  rejectButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FF6A5C",
    backgroundColor: "white",
  },
  rejectButtonText: {
    color: "#FF6A5C",
    fontSize: 14,
    fontWeight: "600",
  },
  acceptButton: {
    minWidth: 100,
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
  tabsList: {
    marginBottom: 16,
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

