import React from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
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
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
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
    // For dates beyond this month, return month and year (e.g., "January 2026")
    // For dates in different years, return just the year (e.g., "2027", "2028")
    const currentYear = today.getFullYear();
    const bookingYear = bookingDateOnly.getFullYear();
    
    if (bookingYear > currentYear) {
      // Different year - just show the year
      return bookingYear.toString();
    } else {
      // Same year, different month - show month and year
      return bookingDateOnly.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    }
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
  onReject 
}: { 
  item: Booking; 
  onAccept?: (id: string) => void; 
  onReject?: (id: string) => void;
}) => (
  <Card style={styles.bookingCard}>
    <View style={styles.bookingHeaderRow}>
      <View style={styles.bookingInfo}>
        <Text style={styles.studentName}>{item.studentName || "Student"}</Text>
        <Text style={styles.instrument}>{item.instrument}</Text>
      </View>
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
    </View>
    <View style={styles.bookingDetails}>
      <View style={styles.detailRow}>
        <Ionicons name="calendar-outline" size={16} color="#666" />
        <Text style={styles.detailText}>{item.date}</Text>
      </View>
      <View style={styles.detailRow}>
        <Ionicons name="time-outline" size={16} color="#666" />
        <Text style={styles.detailText}>{item.time}</Text>
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

export default function BookingsTab({ bookings, loading, onAccept, onReject }: Props) {
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
        <Text style={styles.sectionTitle}>All Bookings</Text>
        <Badge>{bookings.length} total</Badge>
      </View>

      {loading && <ActivityIndicator color="#FF6A5C" style={{ marginBottom: 12 }} />}

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
                  />
                ))}
              </View>
            ))}

            {pendingBookings.length === 0 && sortedUpcomingKeys.length === 0 && (
              <Text style={{ color: "#777", marginTop: 20 }}>No upcoming bookings.</Text>
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
                  />
                ))}
              </>
            )}

            {sortedPastKeys.length === 0 && rejectedBookings.length === 0 && (
              <Text style={{ color: "#777", marginTop: 20 }}>No past bookings.</Text>
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
    flexDirection: "row",
    gap: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
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
});



// import React from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ActivityIndicator,
// } from "react-native";

// type Booking = {
//   _id: string;
//   studentName: string;
//   instrument: string;
//   date: string;
//   time: string;
//   status: "Confirmed" | "Pending";
// };

// type Props = {
//   bookings: Booking[];
//   loading?: boolean;
//   onAccept?: (id: string) => void;
//   onReject?: (id: string) => void;
// };

// export default function BookingsTab({ bookings, loading, onAccept, onReject }: Props) {
//   return (
//     <View style={styles.section}>
//       <Text style={styles.sectionTitle}>All Bookings</Text>

//       {loading && <ActivityIndicator color="#FF6A5C" style={{ marginBottom: 12 }} />}

//       {!loading && bookings.length === 0 && (
//         <Text style={{ color: "#777" }}>No bookings yet.</Text>
//       )}

//       {bookings.map((item) => (
//         <View key={item._id} style={styles.bookingCard}>
//           <View style={styles.bookingHeaderRow}>
//             <View>
//               <Text style={styles.cardTitle}>{item.studentName || "Student"}</Text>
//               <Text style={styles.cardSubtitle}>{item.instrument}</Text>
//             </View>

//             <View
//               style={[
//                 styles.statusBadge,
//                 item.status === "Confirmed" ? styles.confirmed : styles.pending,
//               ]}
//             >
//               <Text style={styles.statusText}>{item.status}</Text>
//             </View>
//           </View>

//           <Text style={styles.cardDetail}>📅 {item.date}</Text>
//           <Text style={styles.cardDetail}>⏰ {item.time}</Text>

//           {item.status === "Pending" && (
//             <View style={styles.actionsRow}>
//               <TouchableOpacity
//                 style={[styles.actionBtn, styles.rejectBtn]}
//                 onPress={() => onReject?.(item._id)}
//               >
//                 <Text style={styles.actionText}>Reject</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={[styles.actionBtn, styles.acceptBtn]}
//                 onPress={() => onAccept?.(item._id)}
//               >
//                 <Text style={[styles.actionText, { color: "white" }]}>Accept</Text>
//               </TouchableOpacity>
//             </View>
//           )}
//         </View>
//       ))}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   section: { marginBottom: 30 },
//   sectionTitle: { fontSize: 20, fontWeight: "700", marginBottom: 15 },
//   bookingCard: {
//     backgroundColor: "white",
//     padding: 18,
//     borderRadius: 15,
//     marginBottom: 12,
//   },
//   bookingHeaderRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 6,
//   },
//   cardTitle: { fontSize: 16, fontWeight: "700" },
//   cardSubtitle: { color: "#777", marginTop: 3 },
//   cardDetail: { color: "#555", marginTop: 4 },
//   statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
//   confirmed: { backgroundColor: "#D6FFE1" },
//   pending: { backgroundColor: "#FFF3C4" },
//   statusText: { fontWeight: "600", color: "#333" },
//   actionsRow: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 12 },
//   actionBtn: {
//     paddingVertical: 8,
//     paddingHorizontal: 14,
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: "#FF6A5C",
//   },
//   rejectBtn: { backgroundColor: "white" },
//   acceptBtn: { backgroundColor: "#FF6A5C", borderColor: "#FF6A5C" },
//   actionText: { fontWeight: "700", color: "#FF6A5C" },
// });
